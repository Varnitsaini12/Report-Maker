from docxtpl import DocxTemplate, RichText
import os

try:
    print("Loading closure_template.docx...")
    doc = DocxTemplate("backend/closure_template.docx")
    
    print("\nIdentified Variables in Template:")
    print(doc.get_undeclared_template_variables())
    
    print("\nAttempting render with dummy data...")
    
    # Dummy Context
    context = {
        "client_name": "Test Client",
        "app_url": "http://test.com",
        "start_date": "01-01-2023",
        "end_date": "10-01-2023",
        "level_1_end_date": RichText("05-01-2023"),
        "level_2_start_date": RichText("08-01-2023"),
        "engagement_timeframe": RichText("Jan 1 to Jan 10"),
        "vulns": [],
        "vuln_count": 0,
        "contact_person": "Tester",
        "email": "test@test.com",
        "phone": "123",
        "auditor_name": "Auditor",
        "engagement_type": "Test"
    }
    
    doc.render(context)
    doc.save("backend/test_output.docx")
    print("\nRender successful! Saved to backend/test_output.docx")
    
except Exception as e:
    print(f"\nERROR: {e}")
