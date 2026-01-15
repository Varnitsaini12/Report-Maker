import zipfile
import re
import os

filename = "template.docx"

print(f"Checking file: {os.path.abspath(filename)}")

if not os.path.exists(filename):
    print("❌ ERROR: File not found! Make sure 'template.docx' is in this folder.")
else:
    try:
        # Open the .docx file as a ZIP archive (which is what .docx files really are)
        with zipfile.ZipFile(filename) as docx:
            # Read the raw XML content
            xml_content = docx.read('word/document.xml').decode('utf-8')
            
            # Check for the forbidden 'tr' tag
            if "{% tr" in xml_content or "{%tr" in xml_content:
                print("\n❌ FAILURE: The '{% tr %}' tag was found!")
                print("   The backend will CRASH until you remove this.")
                
                # Show context
                matches = re.findall(r'.{0,40}{% ?tr.{0,40}', xml_content)
                for m in matches:
                    print(f"   Context found: ...{m}...")
            else:
                print("\n✅ SUCCESS: No '{% tr %}' tags found in the XML.")
                print("   If the backend still fails, it is loading the WRONG file.")

    except Exception as e:
        print(f"Error reading file: {e}")