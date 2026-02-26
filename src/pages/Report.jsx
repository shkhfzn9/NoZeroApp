import React from 'react';
import { useTasks } from '../hooks/useTasks';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { format } from 'date-fns';

export default function Report() {
    const { user, auditLogs, loading, isDayOff } = useTasks();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-400">
                <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            </div>
        );
    }

    // Filter out day-off sessions from analytics
    const filteredLogs = isDayOff
        ? auditLogs.filter(log => {
            const dateStr = new Date(log.created_at).toLocaleDateString('en-CA');
            return !isDayOff(dateStr);
        })
        : auditLogs;
    const dayOffExcluded = auditLogs.length - filteredLogs.length;

    // Analytics Calculations
    const totalAudits = filteredLogs.length;
    const completedTasks = filteredLogs.filter(log => log.completion_status === 'yes').length;
    const partialTasks = filteredLogs.filter(log => log.completion_status === 'half').length;
    const completionRate = totalAudits > 0 ? Math.round(((completedTasks + partialTasks * 0.5) / totalAudits) * 100) : 0;

    // Performance Reason Breakdown
    const reasonCounts = filteredLogs.reduce((acc, log) => {
        const reason = log.performance_reason || 'unknown';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
    }, {});

    // Distraction Analysis
    const allDistractions = filteredLogs.reduce((acc, log) => {
        if (log.distractions && Array.isArray(log.distractions)) {
            return [...acc, ...log.distractions];
        }
        return acc;
    }, []);

    const distractionStats = allDistractions.reduce((acc, dist) => {
        const cause = dist.cause || 'Unknown';
        if (!acc[cause]) {
            acc[cause] = { count: 0, duration: 0 };
        }
        acc[cause].count += 1;
        acc[cause].duration += parseInt(dist.duration || 0);
        return acc;
    }, {});

    const topDistractions = Object.entries(distractionStats)
        .sort(([, a], [, b]) => b.duration - a.duration)
        .slice(0, 5);

    return (
        <div className="bg-background-light dark:bg-background-dark text-charcoal dark:text-white min-h-screen flex justify-center items-start font-sans">
            <div className="w-full max-w-[430px] min-h-screen bg-background-light dark:bg-background-dark relative overflow-hidden pb-10">

                {/* Header */}
                <header className="flex items-center justify-between px-6 py-6 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white dark:bg-card-dark rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-extrabold tracking-tight">Performance Report</h1>
                    <div className="w-10"></div> {/* Spacer */}
                </header>

                {dayOffExcluded > 0 && (
                    <div className="mx-6 mb-2 flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl px-4 py-2.5">
                        <span className="text-base">🌿</span>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                            {dayOffExcluded} day-off session{dayOffExcluded !== 1 ? 's' : ''} excluded from this analysis.
                        </p>
                    </div>
                )}

                <div className="px-6 space-y-8">
                    {/* Summary Cards */}
                    <section className="grid grid-cols-2 gap-4">
                        <div className="bg-primary text-charcoal p-5 rounded-[28px] flex flex-col justify-between aspect-[4/3] shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined self-end text-3xl opacity-50">analytics</span>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Completion Rate</p>
                                <p className="text-4xl font-extrabold leading-none mt-1">{completionRate}%</p>
                            </div>
                        </div>
                        <div className="bg-charcoal dark:bg-zinc-900 text-white p-5 rounded-[28px] flex flex-col justify-between aspect-[4/3] shadow-lg">
                            <span className="material-symbols-outlined self-end text-3xl text-primary">history</span>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Sessions</p>
                                <p className="text-4xl font-extrabold leading-none mt-1">{totalAudits}</p>
                            </div>
                        </div>
                    </section>

                    {/* Performance Breakdown */}
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Focus Quality</h2>
                        <div className="bg-white dark:bg-card-dark rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                            {[
                                { id: 'excellent', label: 'Excellent', color: 'bg-emerald-500' },
                                { id: 'good', label: 'Good', color: 'bg-lime-500' },
                                { id: 'motivating', label: 'Motivating', color: 'bg-cyan-500' },
                                { id: 'deep_work', label: 'Deep Work (Overdue)', color: 'bg-indigo-500' },
                                { id: 'distraction', label: 'Distracted', color: 'bg-orange-500' },
                                { id: 'not_disciplined', label: 'Undisciplined', color: 'bg-rose-500' },
                            ].map(item => {
                                const count = reasonCounts[item.id] || 0;
                                if (count === 0) return null;
                                const percentage = Math.round((count / totalAudits) * 100);

                                return (
                                    <div key={item.id}>
                                        <div className="flex justify-between text-xs font-bold mb-1">
                                            <span>{item.label}</span>
                                            <span>{count} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {Object.keys(reasonCounts).length === 0 && <p className="text-xs text-center text-slate-400 italic">No data yet</p>}
                        </div>
                    </section>

                    {/* Top Distractions */}
                    {topDistractions.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Top Distractions</h2>
                            <div className="bg-white dark:bg-card-dark rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                                {topDistractions.map(([cause, stats], idx) => (
                                    <div key={cause} className={`flex items-center justify-between ${idx !== topDistractions.length - 1 ? 'mb-4 pb-4 border-b border-slate-50 dark:border-white/5' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold text-xs">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{cause}</p>
                                                <p className="text-[10px] text-slate-400">{stats.count} occurrences</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-rose-500">{stats.duration}m</p>
                                            <p className="text-[10px] text-slate-400">lost</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Recent Sessions List */}
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Recent Activity</h2>
                        <div className="space-y-3">
                            {filteredLogs.map((log) => (
                                <div key={log.id} className="bg-white dark:bg-card-dark rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <div className="max-w-[70%]">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                                            {format(new Date(log.created_at), 'MMM d, h:mm a')}
                                        </p>
                                        <h3 className="font-bold text-charcoal dark:text-white truncate">
                                            {log.tasks?.title || 'Unknown Task'}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${log.completion_status === 'yes' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                log.completion_status === 'half' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {log.completion_status === 'yes' ? 'Completed' : log.completion_status === 'half' ? 'Partial' : 'Failed'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">+{log.tasks?.points || 0} pts</span>
                                        </div>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['excellent', 'good', 'motivating'].includes(log.performance_reason)
                                        ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                        : 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
                                        }`}>
                                        <span className="material-symbols-outlined">
                                            {['excellent', 'good', 'motivating'].includes(log.performance_reason) ? 'thumb_up' : 'priority_high'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
