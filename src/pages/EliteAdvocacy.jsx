import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';

export default function EliteAdvocacy() {
    const navigate = useNavigate();
    const { user, loading } = useTasks();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f8f6] dark:bg-[#162210] text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl">hg_logo</span>
        </div>
    );
    if (!user) return <Navigate to="/login" replace />;
    // Design uses #5bec13 for primary
    const primary = "text-[#5bec13]";
    const bgPrimary = "bg-[#5bec13]";

    return (
        <div className="bg-[#f6f8f6] dark:bg-[#162210] font-sans text-[#1a1a1a] dark:text-white min-h-screen pb-24">
            {/* Status Bar */}
            <div className="h-12 w-full"></div>

            <header className="px-6 py-4 max-w-md mx-auto">
                <h1 className="text-3xl font-extrabold leading-tight tracking-tighter text-[#1a1a1a] dark:text-white mb-6">
                    THE ELITE <br />ADVOCATE PROTOCOL
                </h1>

                <div className="bg-[#EBE9FF] dark:bg-[#1a1a2e] rounded-xl p-6 shadow-sm border border-[#EBE9FF]/50 mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-[#6366f1] text-xl">shield</span>
                        <span className="text-[#6366f1] font-bold text-xs tracking-widest uppercase">Protocol Alpha</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-[#1a1a1a] dark:text-white">Command the Narrative.</h2>
                    <p className="text-sm text-[#1a1a1a]/70 dark:text-white/70 leading-relaxed">
                        Show the world your discipline to ascend to the Highest Tier. Elite status is earned, never given.
                    </p>
                </div>

                <section className="space-y-4 mb-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold tracking-[0.1em] text-charcoal/50 dark:text-white/50 uppercase px-1">
                            Submit Proof of Discipline (YouTube/Social Link)
                        </label>
                        <div className="bg-white dark:bg-zinc-900 border border-charcoal/10 dark:border-white/10 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                            <span className="material-symbols-outlined text-charcoal/30">link</span>
                            <input className="w-full border-none focus:ring-0 text-sm font-medium placeholder:text-charcoal/30 dark:placeholder:text-white/30 p-0 bg-transparent" placeholder="https://youtube.com/v/..." type="text" />
                        </div>
                    </div>
                    <button className={`${bgPrimary} w-full hover:brightness-105 active:scale-[0.98] transition-all text-[#1a1a1a] font-extrabold py-4 rounded-xl shadow-lg shadow-[#5bec13]/20 flex items-center justify-center gap-2`}>
                        SUBMIT FOR AUDIT
                        <span className="material-symbols-outlined text-lg">bolt</span>
                    </button>
                    <div className="flex items-start gap-2 px-1">
                        <span className={`material-symbols-outlined ${primary} text-sm mt-0.5`}>verified</span>
                        <p className="text-[11px] font-semibold text-charcoal/60 dark:text-white/60 italic leading-snug">
                            Content proof grants +15% Consistency Weight and Elite Tier priority.
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold tracking-widest text-charcoal dark:text-white uppercase">Elite Proofs</h3>
                        <span className={`text-xs font-bold ${primary} bg-[#5bec13]/10 px-2 py-0.5 rounded`}>LIVE FEED</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-4">
                        {/* Mock Proof Cards */}
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex flex-col space-y-2 group">
                                <div className="aspect-video bg-charcoal rounded-lg overflow-hidden relative border border-charcoal/10">
                                    <div className="absolute inset-0 bg-zinc-800 animate-pulse"></div> {/* Placeholder img */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                                            <span className="material-symbols-outlined text-white">play_arrow</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full overflow-hidden border border-[#5bec13] bg-zinc-300`}></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-charcoal dark:text-white">@ELITE_USER_{i}</span>
                                        <div className={`flex items-center gap-1 ${bgPrimary} px-1 rounded-[2px]`}>
                                            <span className="text-[8px] font-black text-charcoal uppercase">Elite Advocate</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </header>

            {/* Floating Dock */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] bg-[#1a1a1a]/95 dark:bg-white/95 backdrop-blur-md rounded-full py-4 px-8 shadow-2xl flex items-center justify-between z-50 border border-white/10">
                <button onClick={() => navigate('/')} className="text-white/40 dark:text-black/40 hover:text-[#5bec13] transition-colors">
                    <span className="material-symbols-outlined">dashboard</span>
                </button>
                <button onClick={() => navigate('/public-audit')} className="text-white/40 dark:text-black/40 hover:text-[#5bec13] transition-colors">
                    <span className="material-symbols-outlined">analytics</span>
                </button>
                <button className="text-[#5bec13] scale-125 dark:text-black">
                    <span className="material-symbols-outlined">military_tech</span>
                </button>
                <button onClick={() => navigate('/friends')} className="text-white/40 dark:text-black/40 hover:text-[#5bec13] transition-colors">
                    <span className="material-symbols-outlined">group</span>
                </button>
                <button onClick={() => navigate('/profile')} className="text-white/40 dark:text-black/40 hover:text-[#5bec13] transition-colors">
                    <span className="material-symbols-outlined">settings</span>
                </button>
            </div>
        </div>
    );
}
