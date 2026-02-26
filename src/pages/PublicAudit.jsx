import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export default function PublicAudit() {
    const navigate = useNavigate();
    const { auditLogs, user, loading } = useTasks();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F2F4F7] dark:bg-[#0D0D0D] text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl">hg_logo</span>
        </div>
    );
    if (!user) return <Navigate to="/login" replace />;

    // Get days for current month
    const today = new Date();
    const currentMonthDays = eachDayOfInterval({
        start: startOfMonth(today),
        end: endOfMonth(today)
    });

    return (
        <div className="bg-[#F2F4F7] dark:bg-[#0D0D0D] font-sans text-[#2D2D2D] dark:text-white min-h-screen pb-32">

            <main className="pt-4 pb-32 px-5 max-w-[430px] mx-auto space-y-4">
                <header className="flex items-center justify-between py-2">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <h1 className="text-base font-extrabold uppercase tracking-widest text-center">Audit Log</h1>
                    <button className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm text-[#C3D979]">
                        <span className="material-symbols-outlined">download</span>
                    </button>
                </header>

                {/* Calendar Section */}
                <section className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-sm border border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">{format(today, 'MMMM yyyy')}</h2>
                        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-tighter">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#C3D979]"></div> Success</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FF5252]"></div> Missed</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#B1A9DB]"></div> Break</span>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-[6px]">
                        {currentMonthDays.map((day, i) => {
                            const dateStr = format(day, 'yyyy-MM-dd');

                            // Filter logs for this day
                            const dayLogs = auditLogs.filter(l => {
                                const logDate = new Date(l.created_at).toISOString().split('T')[0];
                                return logDate === dateStr;
                            });

                            let status = null;
                            if (dayLogs.length > 0) {
                                // Determine status: If ANY task is 'no' (missed/failed), the day is Red.
                                // If ALL are 'yes'/'half', then Green. 
                                const hasFailure = dayLogs.some(l => l.completion_status === 'no');
                                status = hasFailure ? 'missed' : 'success';
                            }

                            let bg = "bg-zinc-100 dark:bg-zinc-800"; // Default empty/future
                            if (status === 'success') bg = "bg-[#C3D979]";
                            else if (status === 'missed') bg = "bg-[#FF5252]";
                            // else if (status === 'break') bg = "bg-[#B1A9DB]"; // Logic for breaks needs to be defined if we track them

                            return <div key={i} className={`aspect-square rounded-lg ${bg}`} title={`${dateStr}: ${status || 'No Data'}`}></div>
                        })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Emergency Breaks</p>
                            <p className="font-mono text-lg font-bold">00 <span className="text-xs text-zinc-400">/ 05</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Consistency</p>
                            <p className="font-mono text-lg font-bold text-[#C3D979]">{user?.consistency_score || 0}%</p>
                        </div>
                    </div>
                </section>

                {/* Perf Trend */}
                <section className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-sm border border-black/5 dark:border-white/5 overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xs font-black uppercase tracking-[0.15em] text-zinc-400">Performance Trend</h2>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-0.5 bg-zinc-300 border-t border-dashed border-zinc-400"></div>
                                <span className="text-[9px] font-bold uppercase text-zinc-400">Prev.</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-0.5 bg-[#C3D979]"></div>
                                <span className="text-[9px] font-bold uppercase text-zinc-400">Curr.</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-44 mb-8">
                        {/* SVG Graph Placeholder - Simplified from original HTML */}
                        <svg className="w-full h-full" viewBox="0 0 320 160" fill="none">
                            <path d="M0 110 C 40 100, 80 60, 120 45 S 200 40, 240 30 S 280 25, 320 20" stroke="#C3D979" strokeWidth="3" fill="none" strokeLinecap="round" />
                        </svg>

                        {/* Nodes */}
                        <div className="absolute left-[75%] top-[18%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#C3D979] border-2 border-white rounded-full shadow-lg"></div>
                    </div>

                    <div className="bg-[#F8F9FA] dark:bg-zinc-800/40 p-4 rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#C3D979]">trending_up</span>
                            <p className="font-mono text-[10px] font-bold tracking-tight uppercase">
                                DELTA: <span className="text-[#C3D979]">+12.4%</span> INCREASE
                            </p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-[#C3D979] animate-pulse"></div>
                    </div>
                </section>

                {/* Social Proof */}
                <section className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-sm border border-black/5 dark:border-white/5">
                    <div className="mb-5">
                        <h2 className="text-xs font-black uppercase tracking-[0.15em] text-zinc-400">Social Proof</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-[#F8F9FA] dark:bg-zinc-800/40 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#B1A9DB]/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#B1A9DB] font-bold">play_circle</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Daily Discipline Vlog</p>
                                    <p className="text-[10px] text-zinc-400 font-medium">Video Documentation</p>
                                </div>
                            </div>
                            <div className="w-6 h-6 bg-[#C3D979] flex items-center justify-center shadow-sm" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
                                <span className="material-symbols-outlined text-black text-[14px] font-black">check</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-charcoal dark:bg-white text-white dark:text-charcoal rounded-full py-4 px-8 flex items-center justify-between shadow-2xl z-50">
                <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-2xl">grid_view</span>
                </button>
                <button onClick={() => navigate('/leaderboard')} className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-2xl">monitoring</span>
                </button>
                <button onClick={() => navigate('/add-task')} className="flex flex-col items-center gap-1 bg-[#C3D979] text-[#2D2D2D] p-2 rounded-full transform -translate-y-2 shadow-lg shadow-[#C3D979]/30">
                    <span className="material-symbols-outlined text-2xl font-bold">add</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-[#C3D979]">
                    <span className="material-symbols-outlined text-2xl">history_edu</span>
                </button>
                <button onClick={() => navigate('/friends')} className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-2xl">person_search</span>
                </button>
            </nav>
            <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/10 dark:bg-white/10 rounded-full z-50"></div>
        </div>
    );
}
