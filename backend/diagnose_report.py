import traceback
import os
import io
from docxtpl import DocxTemplate
from docx.shared import Cm
from PIL import Image, ImageOps

def run_diagnostics():
    print("--- START DIAGNOSTICS ---")
    
    # 1. Check Template
    print("Checking template.docx...")
    if not os.path.exists("template.docx"):
        print("FAIL: template.docx not found!")
        return
    try:
        doc = DocxTemplate("template.docx")
        print("OK: Template loaded.")
    except Exception:
        print("FAIL: Could not load template.docx")
        traceback.print_exc()
        return

    # 2. Check Images
    print("Checking uploads/...")
    if not os.path.exists("uploads"):
        print("WARN: uploads dir not found.")
    else:
        for f in os.listdir("uploads"):
            if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                try:
                    p = os.path.join("uploads", f)
                    with Image.open(p) as img:
                        img.verify()
                    print(f"OK: Image {f} verified.")
                except Exception:
                    print(f"FAIL: Image {f} is corrupt.")
                    traceback.print_exc()

    # 3. Test Render (Mock)
    print("Testing Render...")
    try:
        context = {
            "client_name": "Test",
            "app_url": "http://test.com",
            "start_date": "01-01-2025",
            "end_date": "01-01-2025",
            "vulns": [],
            "vuln_count": 0
        }
        doc.render(context)
        print("OK: Render successful.")
    except Exception:
        print("FAIL: Render crashed.")
        traceback.print_exc()
        return
        
    print("--- DIAGNOSTICS COMPLETE ---")

if __name__ == "__main__":
    run_diagnostics()
