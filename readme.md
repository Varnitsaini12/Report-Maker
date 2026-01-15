# 🛡️ VAPT Report Generator

An enterprise-grade automated VAPT (Vulnerability Assessment & Penetration Testing) report generator built with:

- ⚡ FastAPI (Backend)
- ⚛️ React (Frontend)
- 📄 DocxTemplate + python-docx (Word report automation)

This system allows security teams to:

✔ Select vulnerabilities  
✔ Add custom observations  
✔ Upload multiple PoC images  
✔ Generate professional audit Word reports automatically  

---

## 🚀 Features

- Image-only PoC upload with validation
- Multiple PoCs per vulnerability
- Auto numbering (12.1.1, 12.1.2, etc.)
- Severity-based sorting
- Severity cell background coloring in Word table
- Secure file deletion
- Streaming Word file download
- Custom description override
- Professional audit formatting

---

## 📁 Project Structure

project-root/
│
├── main.py
├── vulnerabilities.json
├── uploads/ (auto-created, ignored in git)
├── template.docx (NOT tracked in git)
├── App.jsx
├── .gitignore
└── README.md


---

## ⚠️ Important Notice About `template.docx`

> 🔴 **The file `template.docx` is NOT included in this repository.**

You must **create your own Word template** according to your reporting requirements.

### 📝 Instructions:

1. Create a file named `template.docx`
2. Design it using Microsoft Word
3. Add DocxTemplate placeholders like:

```jinja2
{{ client_name }}
{{ app_url }}

{% for v in vulns %}
{{ v.detail_index }} {{ v.title }}
{% endfor %}
