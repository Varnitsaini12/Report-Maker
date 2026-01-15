// frontend/src/App.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { FileText, Download, ShieldAlert, Plus, Trash2, LayoutDashboard, Search, FilePlus } from "lucide-react";
import CreateVulnerability from "./CreateVulnerability";

export default function App() {
  const [view, setView] = useState("dashboard"); // 'dashboard' | 'create'
  const [db, setDb] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [reportData, setReportData] = useState({
    client_name: "Acme Corp",
    app_url: "https://app.acme.com",
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    contact_person: "",
    email: "",
    phone: "",
    auditor_name: "",
    engagement_type: "Web application Gray Box Assessment"
  });
  const [cart, setCart] = useState([]); // Selected vulns

  const fetchDb = () => {
    axios
      .get("http://localhost:8000/api/vulnerabilities")
      .then((res) => setDb(res.data))
      .catch(() => {
        console.log("Backend might be down or unreachable");
      });
  };

  useEffect(() => {
    fetchDb();
  }, []);

  const addToReport = (vuln) => {
    if (!cart.find((v) => v.id === vuln.id)) {
      setCart([...cart, { ...vuln, custom_desc: vuln.description, affected_url: "" }]);
    }
  };

  const removeFromReport = (id) => {
    setCart(cart.filter((v) => v.id !== id));
  };

  const updateDesc = (id, text) => {
    setCart(cart.map((v) => (v.id === id ? { ...v, custom_desc: text } : v)));
  };

  const updateAffectedUrl = (id, text) => {
    setCart(cart.map((v) => (v.id === id ? { ...v, affected_url: text } : v)));
  };

  const uploadPoc = async (vulnId, file) => {
    const formData = new FormData();
    formData.append("vuln_id", vulnId);
    formData.append("file", file);
    try {
      const res = await axios.post("http://localhost:8000/api/upload-poc", formData);
      setCart(cart.map((v) =>
        v.id === vulnId
          ? { ...v, files: [...(v.files || []), { name: file.name, sysName: res.data.filename }] }
          : v
      ));
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image");
    }
  };



  const deletePoc = async (vulnId, filename) => {
    try {
      await axios.delete(`http://localhost:8000/api/delete-poc?filename=${filename}`);
      setCart(cart.map((v) =>
        v.id === vulnId
          ? { ...v, files: v.files.filter((f) => (f.sysName || f) !== filename) }
          : v
      ));
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete image");
    }
  };

  const handleDownload = async () => {
    try {
      const payload = {
        ...reportData,
        selected_ids: cart.map((v) => ({
          id: v.id,
          custom_desc: v.custom_desc,
          affected_url: v.affected_url,
        })),
      };
      const response = await axios.post(
        "http://localhost:8000/api/generate",
        payload,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Report_${reportData.client_name}.docx`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Error generating report. Is the backend running?");
    }
  };

  const filteredDb = db.filter((v) =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen text-slate-200 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              ReportMaker<span className="text-indigo-400">.ai</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setView("create")}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 text-white px-5 py-3 rounded-xl font-semibold border border-slate-700 transition-all"
            >
              <FilePlus className="w-5 h-5 text-indigo-400" /> Add Custom Vulnerability
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" /> Generate Word Doc
            </button>
          </div>
        </header>

        {view === "create" ? (
          <CreateVulnerability
            onBack={() => setView("dashboard")}
            onSave={() => {
              setView("dashboard");
              fetchDb();
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT COLUMN: Controls & Database */}
            <div className="lg:col-span-4 space-y-6">

              {/* Report Details Card */}
              <div className="glass-panel p-6 rounded-2xl">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-indigo-300">
                  <FileText className="w-5 h-5" /> Report Configuration
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Client Name</label>
                    <input
                      className="w-full glass-input p-3 rounded-lg text-sm"
                      placeholder="e.g. Acme Corp"
                      value={reportData.client_name}
                      onChange={(e) =>
                        setReportData({ ...reportData, client_name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Target URL</label>
                    <input
                      className="w-full glass-input p-3 rounded-lg text-sm"
                      placeholder="https://..."
                      value={reportData.app_url}
                      onChange={(e) =>
                        setReportData({ ...reportData, app_url: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Start Date</label>
                      <input
                        type="date"
                        className="w-full glass-input p-3 rounded-lg text-sm"
                        value={reportData.start_date}
                        onChange={(e) =>
                          setReportData({ ...reportData, start_date: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">End Date</label>
                      <input
                        type="date"
                        className="w-full glass-input p-3 rounded-lg text-sm"
                        value={reportData.end_date}
                        onChange={(e) =>
                          setReportData({ ...reportData, end_date: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* New Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Contact Person</label>
                      <input
                        className="w-full glass-input p-3 rounded-lg text-sm"
                        placeholder="John Doe"
                        value={reportData.contact_person}
                        onChange={(e) => setReportData({ ...reportData, contact_person: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Audit Type</label>
                      <input
                        className="w-full glass-input p-3 rounded-lg text-sm"
                        value={reportData.engagement_type}
                        onChange={(e) => setReportData({ ...reportData, engagement_type: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Email ID</label>
                      <input
                        className="w-full glass-input p-3 rounded-lg text-sm"
                        placeholder="john@example.com"
                        value={reportData.email}
                        onChange={(e) => setReportData({ ...reportData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Telephone</label>
                      <input
                        className="w-full glass-input p-3 rounded-lg text-sm"
                        placeholder="+91 8888888888"
                        value={reportData.phone}
                        onChange={(e) => setReportData({ ...reportData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Auditor Name</label>
                    <input
                      className="w-full glass-input p-3 rounded-lg text-sm"
                      placeholder="Auditor Name"
                      value={reportData.auditor_name}
                      onChange={(e) => setReportData({ ...reportData, auditor_name: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Vulnerability DB Card */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col h-[600px]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-rose-300">
                    <ShieldAlert className="w-5 h-5" /> Vulnerability DB
                  </h2>
                  <span className="text-xs font-medium bg-slate-800/50 px-2 py-1 rounded-full text-slate-400">{db.length} items</span>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search vulnerabilities..."
                    className="w-full glass-input pl-10 p-2.5 rounded-lg text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {filteredDb.map((v) => (
                    <div
                      key={v.id}
                      className="group flex flex-col gap-2 p-4 rounded-xl border border-slate-700/30 bg-slate-800/20 hover:bg-slate-700/40 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-sm text-slate-200 leading-tight">{v.title}</div>
                        <button
                          onClick={() => addToReport(v)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                          title="Add to Report"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${v.severity === "High"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : v.severity === "Medium"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                            }`}
                        >
                          {v.severity}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{v.cwe || '???'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Live Preview / Builder */}
            <div className="lg:col-span-8 space-y-6">
              <div className="glass-panel p-8 rounded-2xl min-h-[85vh] relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

                <div className="border-b border-slate-700/50 pb-6 mb-8">
                  <h2 className="text-xl font-bold text-white mb-1">
                    Report Draft Preview
                  </h2>
                  <p className="text-sm text-slate-400">
                    Reviewing contents for <span className="text-indigo-400 font-semibold">{reportData.client_name}</span>
                  </p>
                </div>

                {/* Simulated Section 11.0 */}
                <div className="mb-10">
                  <h3 className="text-xs font-bold uppercase text-slate-500 mb-4 tracking-wider flex items-center gap-2">
                    <div className="w-8 h-[1px] bg-slate-600"></div>
                    11.0 Executive Summary Table
                    <div className="flex-1 h-[1px] bg-slate-600"></div>
                  </h3>

                  <div className="overflow-hidden rounded-xl border border-slate-700/50">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-800/50 text-slate-300">
                        <tr>
                          <th className="p-3 font-semibold w-16 text-center">#</th>
                          <th className="p-3 font-semibold">Vulnerability Title</th>
                          <th className="p-3 font-semibold w-28 text-center">Severity</th>
                          <th className="p-3 font-semibold w-24 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {cart.length === 0 && (
                          <tr>
                            <td colSpan="4" className="p-8 text-center text-slate-500 italic">
                              Select vulnerabilities from the database to populate this table.
                            </td>
                          </tr>
                        )}
                        {cart
                          .sort((a, b) => {
                            const severityRank = {
                              "Critical": 4,
                              "High": 3,
                              "Medium": 2,
                              "Low": 1,
                              "Informational": 0
                            };
                            return (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
                          })
                          .map((v, i) => (
                            <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="p-3 text-center text-slate-400">{i + 1}</td>
                              <td className="p-3 text-slate-200 font-medium">{v.title}</td>
                              <td className="p-3 text-center">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${v.severity === "High" ? "text-rose-400 bg-rose-500/10" :
                                  v.severity === "Medium" ? "text-amber-400 bg-amber-500/10" :
                                    v.severity === "Low" ? "text-emerald-400 bg-emerald-500/10" :
                                      "text-cyan-400 bg-cyan-500/10"
                                  }`}>
                                  {v.severity}
                                </span>
                              </td>
                              <td className="p-3 text-center text-emerald-400 font-medium text-xs">Open</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Simulated Section 12.0 */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-500 mb-6 tracking-wider flex items-center gap-2">
                    <div className="w-8 h-[1px] bg-slate-600"></div>
                    12.0 Detailed Technical Findings
                    <div className="flex-1 h-[1px] bg-slate-600"></div>
                  </h3>

                  <div className="space-y-6">
                    {cart.map((v, i) => (
                      <div
                        key={v.id}
                        className="p-6 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/30 transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-bold text-lg text-white">
                            <span className="text-indigo-400 mr-2">12.{i + 1}</span> {v.title}
                          </h4>
                          <button
                            onClick={() => removeFromReport(v.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-2 hover:bg-rose-500/10 rounded-lg"
                            title="Remove Findings"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex gap-4 text-xs mb-4">
                          <div className="px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-300 font-mono">
                            CWE: <span className="text-white">{v.cwe}</span>
                          </div>
                          <div className="px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-300 font-mono">
                            CVSS: <span className="text-white">{v.cvss}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                              Affected URL
                            </label>
                            <input
                              className="w-full glass-input p-3 rounded-lg text-sm text-slate-200"
                              value={v.affected_url || ""}
                              onChange={(e) => updateAffectedUrl(v.id, e.target.value)}
                              placeholder="Default: Throughout the application"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                              Observation & Remediation Notes
                            </label>
                            <textarea
                              className="w-full glass-input p-3 rounded-lg text-sm text-slate-200 min-h-[100px]"
                              value={v.custom_desc}
                              onChange={(e) => updateDesc(v.id, e.target.value)}
                              placeholder="Enter detailed observation here..."
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                              Proof of Concept (PoC)
                            </label>
                            <div className="space-y-3">
                              {/* List of uploaded files */}
                              {v.files && v.files.length > 0 && (
                                <div className="space-y-2">
                                  {v.files.map((fileObj, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs bg-slate-800/60 p-2 rounded border border-slate-700 text-slate-300">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                      <span className="truncate flex-1">{fileObj.name || fileObj}</span>
                                      <button
                                        onClick={() => deletePoc(v.id, fileObj.sysName || fileObj)}
                                        className="text-slate-400 hover:text-red-400 transition-colors"
                                        title="Delete file"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Upload Button */}
                              <div className="relative border-2 border-dashed border-slate-700 rounded-lg p-6 hover:border-indigo-500/50 transition-colors text-center group">
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  onChange={(e) => {
                                    Array.from(e.target.files).forEach((file) => {
                                      uploadPoc(v.id, file);
                                    });
                                    e.target.value = null; // Reset input to allow same file selection again
                                  }}
                                />
                                <div className="pointer-events-none">
                                  <div className="mx-auto w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mb-2 group-hover:bg-indigo-600 transition-colors">
                                    <Plus className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                  </div>
                                  <p className="text-xs text-slate-400">Click or Drag images here</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
