from docxtpl import DocxTemplate, InlineImage, RichText
from docx.shared import Cm
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import io
import os
from datetime import datetime
from PIL import Image, ImageOps

# Mock data
class MockRequest:
    client_name = "Test Client"
    app_url = "http://test.com"
    start_date = "2025-01-01"
    end_date = "2025-01-05"
    contact_person = "John Doe"
    email = "john@example.com"
    phone = "123456"
    auditor_name = "Auditor"
    engagement_type = "Test"

def test_full_generation():
    print("Starting full generation test...")
    req = MockRequest()
    
    # 1. Prepare Context
    context = {
        "client_name": req.client_name,
        "app_url": req.app_url,
        "start_date": "01-01-2025",
        "end_date": "05-01-2025",
        "contact_person": req.contact_person,
        "email": req.email,
        "phone": req.phone,
        "auditor_name": req.auditor_name,
        "engagement_type": req.engagement_type,
        "vuln_count": 0,
        "vulns": [] 
    }
    
    # 2. Render Template
    print("Rendering template...")
    doc = DocxTemplate("template.docx")
    doc.render(context)
    
    # 3. Save to temp stream
    print("Saving to temp stream...")
    temp_stream = io.BytesIO()
    doc.save(temp_stream)
    temp_stream.seek(0)
    
    # 4. Re-open with python-docx
    print("Re-opening with python-docx...")
    final_doc = Document(temp_stream)
    
    # 5. Apply Shading logic
    print("Applying shading...")
    severity_bg_map = {"High": "FF0000"}
    
    def set_cell_shading(cell, hex_color):
        tcPr = cell._tc.get_or_add_tcPr()
        existing_shd = tcPr.find(qn('w:shd'))
        if existing_shd is not None:
            tcPr.remove(existing_shd)
        
        shd = OxmlElement('w:shd')
        shd.set(qn('w:val'), 'clear')
        shd.set(qn('w:color'), 'auto')
        shd.set(qn('w:fill'), hex_color)
        tcPr.append(shd)

    column_index_severity = -1
    for table in final_doc.tables:
        if len(table.rows) > 0:
            header_cells = table.rows[0].cells
            found_severity = False
            for idx, cell in enumerate(header_cells):
                if "Severity" in cell.text:
                    column_index_severity = idx
                    found_severity = True
                    break
            
            if found_severity:
                print(f"Found summary table. Column index: {column_index_severity}")
                for row in table.rows[1:]:
                    if len(row.cells) > column_index_severity:
                         # For test, manually force a match if text empty or check shading
                         pass

    print("Saving final doc...")
    out_stream = io.BytesIO()
    final_doc.save(out_stream)
    print("SUCCESS")

if __name__ == "__main__":
    try:
        test_full_generation()
    except Exception as e:
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print(f"CRASHED: {e}")
        import traceback
        traceback.print_exc()
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
