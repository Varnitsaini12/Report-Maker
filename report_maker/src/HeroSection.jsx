import { ShieldCheck, FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen text-slate-200 font-sans flex flex-col items-center justify-center p-8 bg-slate-900 overflow-hidden relative">

            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-4xl w-full text-center space-y-12 z-10">

                {/* Header / About */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 shadow-2xl mb-4 backdrop-blur-md">
                        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            ReportMaker<span className="text-indigo-400">.ai</span>
                        </h1>
                    </div>

                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Streamline your security reporting process. Generate professional vulnerability assessment reports with ease, tailored for both initial findings and closure verification.
                    </p>
                </div>

                {/* Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">

                    {/* Level 1 Card */}
                    <button
                        onClick={() => navigate('/level-1')}
                        className="group relative p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 hover:border-indigo-500/50 transition-all duration-300 text-left hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="bg-slate-900/50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/20 transition-all">
                                <FileText className="w-7 h-7 text-indigo-400" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">Level-1 Report</h3>
                            <p className="text-slate-400 text-sm mb-8 flex-grow">
                                Standard vulnerability assessment report using the default template. Ideal for initial engagement findings.
                            </p>

                            <div className="flex items-center text-indigo-400 font-semibold group-hover:translate-x-2 transition-transform">
                                Create Report <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </button>

                    {/* Closure Report Card */}
                    <button
                        onClick={() => navigate('/closure')}
                        className="group relative p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 hover:border-emerald-500/50 transition-all duration-300 text-left hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="bg-slate-900/50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/20 transition-all">
                                <ShieldCheck className="w-7 h-7 text-emerald-400" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">Closure Report</h3>
                            <p className="text-slate-400 text-sm mb-8 flex-grow">
                                Verification report for re-tested vulnerabilities. Includes additional timelines for Level-1 completion and Level-2 start.
                            </p>

                            <div className="flex items-center text-emerald-400 font-semibold group-hover:translate-x-2 transition-transform">
                                Create Report <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </button>

                </div>
            </div>
        </div>
    );
}
