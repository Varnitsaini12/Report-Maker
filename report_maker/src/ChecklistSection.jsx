import React from 'react';
import { CheckSquare } from 'lucide-react';

const checklistData = {
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
};

export default function ChecklistSection({ data, onChange }) {
    // If no data is passed, we initialize with defaults in parent, but here we render based on keys
    const categories = Object.keys(checklistData);

    return (
        <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-emerald-300">
                <CheckSquare className="w-5 h-5" /> 8.0 Compliance Checklist
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-800/50 text-slate-300">
                        <tr>
                            <th className="p-3 border border-slate-700/50 w-1/4">OWASP Top 10</th>
                            <th className="p-3 border border-slate-700/50">SANS Top 10 / Details</th>
                            <th className="p-3 border border-slate-700/50 w-24">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {categories.map((category, catIdx) => {
                            const items = checklistData[category];
                            return (
                                <tr key={catIdx} className="hover:bg-slate-800/30">
                                    <td className="p-3 border border-slate-700/50 font-medium text-slate-200 align-top bg-slate-800/20">
                                        {category}
                                    </td>
                                    <td className="p-3 border border-slate-700/50 text-slate-400">
                                        <ul className="list-disc pl-4 space-y-1">
                                            {items.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="p-3 border border-slate-700/50 align-top">
                                        <select
                                            className={`w-full p-2 rounded text-xs font-semibold glass-input border ${data[category] === "Found"
                                                ? "text-rose-400 border-rose-500/30 bg-rose-500/10"
                                                : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                                                }`}
                                            value={data[category] || "Not Found"}
                                            onChange={(e) => onChange(category, e.target.value)}
                                        >
                                            <option value="Not Found">Not Found</option>
                                            <option value="Found">Found</option>
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
