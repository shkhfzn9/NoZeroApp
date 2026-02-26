import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';

export default function ResurrectionAudit() {
    const navigate = useNavigate();
    const { user, loading } = useTasks();
    const [acknowledged, setAcknowledged] = useState(false);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f6f8] dark:bg-[#101622] text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl">hg_logo</span>
        </div>
    );
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="bg-[#f5f6f8] dark:bg-[#101622] font-sans antialiased min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-[390px] h-[844px] bg-white text-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-[#1a1a1a] relative flex flex-col">
                {/* Grid Background */}
                <div className="absolute inset-0 pointer-events-none opacity-5" style={{
                    backgroundImage: 'linear-gradient(to right, #0d59f2 1px, transparent 1px), linear-gradient(to bottom, #0d59f2 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}></div>

                <header className="relative z-10 pt-16 px-8 pb-8 border-b border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-[#f20d0d] animate-pulse rounded-full"></span>
                        <p className="text-[10px] tracking-[0.2em] font-bold text-slate-500 uppercase">System Status: Interrupted</p>
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter leading-none uppercase italic border-l-4 border-[#f20d0d] pl-4">
                        Discipline<br />Resurrection<br />Protocol
                    </h1>
                </header>

                <main className="relative z-10 flex-1 flex flex-col px-8 pt-10 pb-12">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Audit ID</p>
                            <p className="text-sm font-bold font-mono">NZ-8842-RES</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Failure Class</p>
                            <p className="text-sm font-bold font-mono text-[#f20d0d] underline decoration-2">CRITICAL EXIT</p>
                        </div>
                    </div>

                    <div className="bg-white border-[3px] border-[#f20d0d] rounded-xl p-6 shadow-[8px_8px_0px_rgba(242,13,13,0.1)] mb-10">
                        <div className="flex justify-between items-start mb-4">
                            <span className="material-symbols-outlined text-[#f20d0d] text-3xl">warning</span>
                            <span className="text-[10px] font-bold bg-[#f20d0d] text-white px-2 py-0.5 rounded">VOIDED</span>
                        </div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Penance Requirement</h2>
                        <p className="text-lg font-bold leading-tight text-slate-900 mb-4">
                            System reset detected. All historical streaks are void. You begin again at <span className="text-[#f20d0d] italic underline">Zero</span>.
                        </p>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#f20d0d] w-full"></div>
                        </div>
                    </div>

                    <div className="mb-auto">
                        <label className="group flex items-start gap-4 cursor-pointer">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={acknowledged}
                                    onChange={(e) => setAcknowledged(e.target.checked)}
                                    className="peer h-6 w-6 rounded border-2 border-slate-300 text-[#1a1a1a] focus:ring-0 transition-all cursor-pointer"
                                />
                            </div>
                            <span className="text-sm font-medium leading-tight text-slate-600 group-hover:text-slate-900 select-none">
                                I acknowledge my past failure and commit to absolute consistency.
                            </span>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <button
                            disabled={!acknowledged}
                            onClick={() => navigate('/')}
                            className={`w-full bg-[#1a1a1a] py-5 rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform ${!acknowledged ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="text-[#bef264] font-black tracking-tighter uppercase text-lg italic">Re-Initialize Audit</span>
                            <span className="material-symbols-outlined text-[#bef264]">restart_alt</span>
                        </button>
                        <div className="flex justify-center">
                            <button onClick={() => navigate('/audit/exit')} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-[#f20d0d] transition-colors flex items-center gap-1">
                                No, I am still not ready
                                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </main>

                <footer className="relative z-10 px-8 py-6 bg-slate-50 border-t border-slate-200">
                    <div className="flex justify-between items-center opacity-40 grayscale">
                        <div className="text-[9px] font-mono leading-none">
                            <p>SYSTEM_v4.0.1</p>
                            <p>ENCRYPTION: ACTIVE</p>
                        </div>
                        {/* Barcode Placeholder */}
                        <div className="w-24 h-6 bg-black/10"></div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
