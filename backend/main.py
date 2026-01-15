from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from docxtpl import DocxTemplate, InlineImage, RichText
from docx.shared import Cm
from typing import List, Optional
import json
import os
import io
from datetime import datetime
from PIL import Image, ImageOps

# ---------------- APP ----------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXT = {"png", "jpg", "jpeg", "webp"}
ALLOWED_MIME = {"image/png", "image/jpeg", "image/webp"}

# ---------------- DB ----------------
def get_db():
    try:
        with open("vulnerabilities.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []

# ---------------- MODELS ----------------
class VulnSelection(BaseModel):
    id: int
    custom_desc: Optional[str] = None
    affected_url: Optional[str] = None

class ReportRequest(BaseModel):
    client_name: str
    app_url: str
    start_date: str
    end_date: str
    contact_person: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    auditor_name: Optional[str] = ""
    engagement_type: Optional[str] = "Web Application Security Assessment"
    selected_ids: List[VulnSelection]
    checklist: Optional[dict] = {}

class VulnerabilityCreate(BaseModel):
    title: str
    severity: str
    cvss: float
    cwe: str
    description: str
    impact: str
    recommendation: str

# ---------------- API ----------------
@app.get("/api/vulnerabilities")
def get_vulns():
    return get_db()

@app.post("/api/vulnerabilities")
def create_vuln(vuln: VulnerabilityCreate):
    db = get_db()
    new_id = max([v["id"] for v in db], default=0) + 1
    data = vuln.dict()
    data["id"] = new_id
    db.append(data)

    with open("vulnerabilities.json", "w", encoding="utf-8") as f:
        json.dump(db, f, indent=4)

    return data

# ---------------- UPLOAD POC ----------------
@app.post("/api/upload-poc")
async def upload_poc(vuln_id: int = Form(...), file: UploadFile = File(...)):

    if not file.filename:
        raise HTTPException(400, "No file uploaded")

    ext = file.filename.rsplit(".", 1)[-1].lower()

    if ext not in ALLOWED_EXT:
        raise HTTPException(400, "Only image files are allowed")

    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(400, "Only image files are allowed")

    try:
        img = Image.open(file.file)
        img.verify()
    except:
        raise HTTPException(400, "Only image files are allowed")

    file.file.seek(0)

    filename = f"vuln_{vuln_id}_{datetime.now().timestamp()}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(await file.read())

    return {"status": "uploaded", "filename": filename}

# ---------------- DELETE POC ----------------
@app.delete("/api/delete-poc")
def delete_poc(filename: str):

    if not filename.startswith("vuln_") or ".." in filename:
        raise HTTPException(400, "Invalid filename")

    path = os.path.join(UPLOAD_DIR, filename)

    if not os.path.exists(path):
        raise HTTPException(404, "File not found")

    os.remove(path)
    return {"status": "deleted"}

# ---------------- GENERATE REPORT ----------------
@app.post("/api/generate")
def generate_report(req: ReportRequest):

    db = {v["id"]: v for v in get_db()}
    selected_vulns = []

    severity_rank = {
        "Critical": 4,
        "High": 3,
        "Medium": 2,
        "Low": 1,
        "Informational": 0
    }

    for item in req.selected_ids:
        if item.id in db:
            v = db[item.id].copy()
            if item.custom_desc:
                v["description"] = item.custom_desc
            v["affected_url"] = item.affected_url or "Throughout the application"
            v["rank"] = severity_rank.get(v.get("severity"), 0)
            selected_vulns.append(v)

    selected_vulns.sort(key=lambda x: x["rank"], reverse=True)

    doc = DocxTemplate("template.docx")

    # Load PoCs
    poc_map = {}
    for f in os.listdir(UPLOAD_DIR):
        if f.startswith("vuln_"):
            try:
                vid = int(f.split("_")[1])
                poc_map.setdefault(vid, []).append(os.path.join(UPLOAD_DIR, f))
            except:
                pass

    # Process vulns
    for idx, v in enumerate(selected_vulns):
        v["summary_index"] = idx + 1
        v["detail_index"] = f"12.{idx+1}"

        # Format text
        for field in ["description", "impact", "recommendation"]:
            if v.get(field):
                rt = RichText()
                for line in v[field].replace("\\n", "\n").split("\n"):
                    rt.add(line, font="Century Gothic", size=22)
                    rt.add("\n", font="Century Gothic", size=22)
                v[field] = rt

        # Severity coloring
        sev_map = {
            "Critical": "8B0000",
            "High": "FF0000",
            "Medium": "E6B800",
            "Low": "00A300",
            "Informational": "00BFFF"
        }

        sev_str = v["severity"]   # store original string

# Summary severity (plain)
        sev_rt = RichText()
        sev_rt.add(sev_str, font="Century Gothic", size=22)
        v["severity"] = sev_rt

        # Detail severity (colored)
        sev_rt2 = RichText()
        sev_rt2.add(sev_str, font="Century Gothic", size=22, color=sev_map.get(sev_str), bold=True)
        v["severity_detail"] = sev_rt2

        # Images
        imgs = []
        for i, p in enumerate(poc_map.get(v["id"], [])):
            try:
                with Image.open(p) as im:
                    bordered = ImageOps.expand(im, border=2, fill="black")
                    buf = io.BytesIO()
                    bordered.save(buf, format=im.format or "PNG")
                    buf.seek(0)
                    img_obj = InlineImage(doc, buf, width=Cm(21.4), height=Cm(10.8))
            except:
                img_obj = InlineImage(doc, p, width=Cm(21.4), height=Cm(10.8))

            imgs.append({
                "label": f"{v['detail_index']}.{i+1}",
                "img": img_obj
            })

        v["pocs"] = imgs

    # ---------------- checklist ----------------
    master_checklist = {
        "A01: Broken Access Control": [
            "CWE - 22: Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')",
            "CWE - 352: Cross-Site Request Forgery (CSRF)",
            "CWE - 276: Incorrect Default Permissions"
        ],
        "A02: Cryptographic Failures": [
            "None"
        ],
        "A03: Injection": [
            "CWE - 79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')",
            "CWE - 89: Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')",
            "CWE - 20: Improper Input Validation",
            "CWE - 78: Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection')",
            "CWE - 77: Improper Neutralization of Special Elements used in a Command ('Command Injection')",
            "CWE - 94: Improper Control of Generation of Code ('Code Injection')"
        ],
        "A04: Insecure Design": [
            "CWE - 434: Unrestricted Upload of File with Dangerous Type"
        ],
        "A05: Security Misconfiguration": [
            "CWE - 611: Improper Restriction of XML External Entity Reference"
        ],
        "A06: Vulnerable and Outdated Components": [
            "CWE - 190: Integer Overflow or Wraparound"
        ],
        "A07: Identification and Authentication Failures": [
            "CWE - 287: Improper Authentication",
            "CWE - 798: Use of Hard-coded Credentials",
            "CWE - 306: Missing Authentication for Critical Function"
        ],
        "A08: Software and Data Integrity Failures": [
            "CWE - 502: Deserialization of Untrusted Data"
        ],
        "A09: Security Logging and Monitoring Failures": [
            "None"
        ],
        "A10: Server-Side Request Forgery": [
            "CWE - 918: Server-Side Request Forgery (SSRF)"
        ],
        "Others": [
            "CWE - 119: Improper Restriction of Operations within the Bounds of a Memory Buffer",
            "CWE - 125: Out-of-bounds Read",
            "CWE - 362: Concurrent Execution using Shared Resource with Improper Synchronization ('Race Condition')",
            "CWE - 400: Uncontrolled Resource Consumption",
            "CWE - 416: Use After Free",
            "CWE - 476: NULL Pointer Dereference",
            "CWE - 787: Out-of-bounds Write",
            "CWE - 862: Missing Authorization"
        ]
    }

    # checklist context mapping
    # Maps specific items to template variables like {{ cwe_79 }} or {{ status_a02 }}
    
    import re
    checklist_context = {}
    user_checklist = req.checklist or {}

    for cat, items in master_checklist.items():
        # Get category prefix (A01, A02, ..., Others)
        if ":" in cat:
            cat_prefix = cat.split(":")[0].lower()
        else:
            cat_prefix = cat.lower()
            
        # User now sends status per category (e.g. key="A01: Broken Access Control")
        # We default to "Not Found" if the category isn't in the checklist
        cat_status = user_checklist.get(cat, "Not Found")

        for item in items:
            # All items in this category inherit the category's status
            status = cat_status
            
            var_name = ""
            # Try to find CWE number
            cwe_match = re.search(r"CWE - (\d+)", item)
            if cwe_match:
                var_name = f"cwe_{cwe_match.group(1)}"
            elif item == "None":
                var_name = f"status_{cat_prefix}"
            else:
                # Fallback for anything else (shouldn't happen with current data)
                clean_item = re.sub(r"[^a-zA-Z0-9]", "_", item[:10]).lower()
                var_name = f"status_{cat_prefix}_{clean_item}"
            
            if var_name:
                checklist_context[var_name] = status

    def fmt(d):
        try:
            return datetime.strptime(d, "%Y-%m-%d").strftime("%d-%m-%Y")
        except:
            return d

    def get_date_parts(d):
        try:
            dt = datetime.strptime(d, "%Y-%m-%d")
            day = dt.day
            if 4 <= day <= 20 or 24 <= day <= 30:
                suffix = "th"
            else:
                suffix = ["st", "nd", "rd"][day % 10 - 1]
            return str(day), suffix, dt.strftime(' %B %Y') # leading space for month
        except:
            return d, "", ""

    end_day, end_suffix, end_month_year = get_date_parts(req.end_date)

    context = {
        "client_name": req.client_name,
        "app_url": req.app_url,
        "start_date": fmt(req.start_date),
        "end_date": fmt(req.end_date),
        "end_day": end_day,
        "end_suffix": end_suffix,
        "end_month_year": end_month_year,
        "contact_person": req.contact_person,
        "email": req.email,
        "phone": req.phone,
        "auditor_name": req.auditor_name,
        "engagement_type": req.engagement_type,
        "vulns": selected_vulns,
        "vuln_count": len(selected_vulns)
    }
    
    # Merge checklist variables into context
    context.update(checklist_context)

    try:
        doc.render(context)
        
        # Save temp and reopen to ensure consistency if needed, but stream is fine
        stream = io.BytesIO()
        doc.save(stream)
        stream.seek(0)
        
        # 🔥 Delete PoCs after successful generation
        for f in os.listdir(UPLOAD_DIR):
            try:
                os.remove(os.path.join(UPLOAD_DIR, f))
            except:
                pass

        filename = f"Report_{req.client_name}_{datetime.now().strftime('%Y%m%d')}.docx"

        return StreamingResponse(
            stream,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        print("REPORT ERROR:", e)
        raise HTTPException(500, str(e))
