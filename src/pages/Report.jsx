import React from 'react';
import { useTasks } from '../hooks/useTasks';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { format, subDays, startOfWeek, startOfMonth, isWithinInterval, differenceInDays, parseISO } from 'date-fns';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

// ─── Date Range Filter Presets ──────────────────────────────────────────────────
const PERIOD_OPTIONS = [
    { key: 'overall', label: 'Overall' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'custom', label: 'Custom' },
];

function getDateRange(period, customStart, customEnd) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    switch (period) {
        case 'yesterday': {
            const y = subDays(new Date(), 1);
            y.setHours(0, 0, 0, 0);
            const yEnd = subDays(new Date(), 1);
            yEnd.setHours(23, 59, 59, 999);
            return { start: y, end: yEnd };
        }
        case 'week': {
            const s = startOfWeek(new Date(), { weekStartsOn: 1 });
            return { start: s, end: today };
        }
        case 'month': {
            const s = startOfMonth(new Date());
            return { start: s, end: today };
        }
        case 'custom':
            return {
                start: customStart ? new Date(customStart + 'T00:00:00') : new Date(0),
                end: customEnd ? new Date(customEnd + 'T23:59:59') : today,
            };
        default: // overall
            return { start: new Date(0), end: today };
    }
}

// ─── Custom Recharts Tooltip ────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-charcoal text-white px-3 py-2 rounded-xl text-xs shadow-lg border border-white/10">
            <p className="font-bold mb-0.5">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}: <span className="font-bold">{typeof p.value === 'number' ? (p.value % 1 === 0 ? p.value : p.value.toFixed(1)) : p.value}</span>
                </p>
            ))}
        </div>
    );
}

// ─── Section Card Wrapper ───────────────────────────────────────────────────────
function Section({ title, icon, children, className }) {
    return (
        <section className={className}>
            <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">{title}</h2>
            </div>
            {children}
        </section>
    );
}

// ─── Stat Mini Card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent = 'primary', subtitle }) {
    const bgMap = {
        primary: 'bg-primary/10 text-primary',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
        rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
        sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
    };
    return (
        <div className="bg-white dark:bg-card-dark rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center", bgMap[accent])}>
                <span className="material-symbols-outlined text-lg">{icon}</span>
            </div>
            <div>
                <p className="text-2xl font-extrabold leading-none">{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{label}</p>
                {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Report Component
// ═══════════════════════════════════════════════════════════════════════════════
export default function Report() {
    const { user, tasks, auditLogs, loading, isDayOff } = useTasks();
    const navigate = useNavigate();

    // Date filter state
    const [period, setPeriod] = React.useState('overall');
    const [customStart, setCustomStart] = React.useState('');
    const [customEnd, setCustomEnd] = React.useState('');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-400">
                <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            </div>
        );
    }

    // ─── Date Range Filtering ──────────────────────────────────────────────────
    const { start: rangeStart, end: rangeEnd } = getDateRange(period, customStart, customEnd);

    const inRange = (dateStr) => {
        const d = new Date(dateStr);
        return d >= rangeStart && d <= rangeEnd;
    };

    // Filter out day-off sessions
    const allLogs = isDayOff
        ? auditLogs.filter(log => {
            const dateStr = new Date(log.created_at).toLocaleDateString('en-CA');
            return !isDayOff(dateStr);
        })
        : auditLogs;
    const dayOffExcluded = auditLogs.length - allLogs.length;

    // Apply date range filter
    const filteredLogs = allLogs.filter(log => inRange(log.created_at));
    const allTasks = tasks || [];
    const filteredTasks = allTasks.filter(t => inRange(t.created_at));
    const missedTasks = filteredTasks.filter(t => t.status === 'missed');
    const completedTasksList = filteredTasks.filter(t => t.status === 'completed');

    // ─── Core Metrics ──────────────────────────────────────────────────────────
    const totalAudits = filteredLogs.length;
    const fullyCompleted = filteredLogs.filter(l => l.completion_status === 'yes').length;
    const partialCompleted = filteredLogs.filter(l => l.completion_status === 'half').length;
    const notCompleted = filteredLogs.filter(l => l.completion_status === 'no').length;
    const completionRate = totalAudits > 0 ? Math.round(((fullyCompleted + partialCompleted * 0.5) / totalAudits) * 100) : 0;

    const totalPoints = completedTasksList.reduce((s, t) => s + (t.points || 0), 0);
    const pointsLost = missedTasks.reduce((s, t) => s + (t.points || 0), 0);
    const avgTasksPerDay = (() => {
        if (filteredTasks.length === 0) return 0;
        const dates = new Set(filteredTasks.map(t => new Date(t.created_at).toLocaleDateString('en-CA')));
        return (filteredTasks.length / dates.size).toFixed(1);
    })();

    // ─── Streak & Consistency Calculation ──────────────────────────────────────
    // Build a map of dates where user had tasks and completed at least one
    const buildConsistencyData = () => {
        const dateMap = {};

        allTasks.forEach(task => {
            const dateStr = new Date(task.created_at).toLocaleDateString('en-CA');
            if (!dateMap[dateStr]) dateMap[dateStr] = { total: 0, completed: 0, missed: 0, points: 0 };
            dateMap[dateStr].total++;
            if (task.status === 'completed') {
                dateMap[dateStr].completed++;
                dateMap[dateStr].points += (task.points || 0);
            }
            if (task.status === 'missed') {
                dateMap[dateStr].missed++;
            }
        });

        return dateMap;
    };

    const consistencyMap = buildConsistencyData();
    const sortedDates = Object.keys(consistencyMap).sort();

    // Calculate longest streak (consecutive days with at least 1 completion)
    const calculateStreaks = () => {
        if (sortedDates.length === 0) return { current: 0, longest: 0, totalActiveDays: 0, perfectDays: 0 };

        let current = 0;
        let longest = 0;
        let tempStreak = 0;
        let totalActiveDays = sortedDates.length;
        let perfectDays = 0;

        for (let i = 0; i < sortedDates.length; i++) {
            const data = consistencyMap[sortedDates[i]];

            if (data.completed > 0) {
                tempStreak++;
                longest = Math.max(longest, tempStreak);

                if (data.completed === data.total && data.total > 0) {
                    perfectDays++;
                }
            } else {
                tempStreak = 0;
            }

            // Check if this date is consecutive with previous
            if (i > 0) {
                const prev = new Date(sortedDates[i - 1] + 'T00:00:00');
                const curr = new Date(sortedDates[i] + 'T00:00:00');
                if (differenceInDays(curr, prev) > 1 && data.completed > 0) {
                    tempStreak = 1; // Reset if gap
                }
            }
        }

        // Current streak: count backwards from today
        const todayStr = new Date().toLocaleDateString('en-CA');
        current = 0;
        let checkDate = new Date();
        while (true) {
            const ds = checkDate.toLocaleDateString('en-CA');
            const dayData = consistencyMap[ds];
            if (dayData && dayData.completed > 0) {
                current++;
                checkDate = subDays(checkDate, 1);
            } else if (!dayData && ds !== todayStr) {
                // No tasks that day — streak broken
                break;
            } else {
                break;
            }
        }

        return { current, longest, totalActiveDays, perfectDays };
    };

    const streakData = calculateStreaks();

    // ─── Performance Reason Breakdown ──────────────────────────────────────────
    const reasonLabels = {
        excellent: { label: 'Excellent', color: '#10b981', bg: 'bg-emerald-500' },
        good: { label: 'Good', color: '#84cc16', bg: 'bg-lime-500' },
        motivating: { label: 'Motivating', color: '#06b6d4', bg: 'bg-cyan-500' },
        deep_work: { label: 'Deep Work (Overdue)', color: '#6366f1', bg: 'bg-indigo-500' },
        distraction: { label: 'Distracted', color: '#f97316', bg: 'bg-orange-500' },
        not_disciplined: { label: 'Undisciplined', color: '#ef4444', bg: 'bg-rose-500' },
    };

    const reasonCounts = filteredLogs.reduce((acc, log) => {
        const reason = log.performance_reason || 'unknown';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
    }, {});

    const focusPieData = Object.entries(reasonLabels)
        .filter(([key]) => (reasonCounts[key] || 0) > 0)
        .map(([key, meta]) => ({
            name: meta.label,
            value: reasonCounts[key] || 0,
            color: meta.color,
        }));

    // ─── Distraction Analysis ──────────────────────────────────────────────────
    const allDistractions = filteredLogs.reduce((acc, log) => {
        if (log.distractions && Array.isArray(log.distractions)) {
            return [...acc, ...log.distractions];
        }
        return acc;
    }, []);

    const distractionStats = allDistractions.reduce((acc, dist) => {
        const cause = dist.cause || 'Unknown';
        if (!acc[cause]) acc[cause] = { count: 0, duration: 0 };
        acc[cause].count += 1;
        acc[cause].duration += parseInt(dist.duration || 0);
        return acc;
    }, {});

    const topDistractions = Object.entries(distractionStats)
        .sort(([, a], [, b]) => b.duration - a.duration)
        .slice(0, 5);

    const totalDistractionTime = allDistractions.reduce((s, d) => s + parseInt(d.duration || 0), 0);
    const totalDistractionCount = allDistractions.length;

    // ─── Daily Productivity Trend (last 30 days OR filtered range) ─────────────
    const buildTrendData = () => {
        const days = [];
        let d = period === 'overall'
            ? subDays(new Date(), 29)
            : new Date(rangeStart);
        const end = new Date(rangeEnd);
        d.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        while (d <= end) {
            const ds = d.toLocaleDateString('en-CA');
            const dayData = consistencyMap[ds];
            days.push({
                date: format(d, 'MMM d'),
                dateStr: ds,
                completed: dayData?.completed || 0,
                missed: dayData?.missed || 0,
                total: dayData?.total || 0,
                points: dayData?.points || 0,
                rate: dayData && dayData.total > 0 ? Math.round((dayData.completed / dayData.total) * 100) : 0,
            });
            d = new Date(d.getTime() + 86400000);
        }
        return days;
    };

    const trendData = buildTrendData();

    // ─── Consistency Heatmap Data (last 90 days) ──────────────────────────────
    const buildHeatmapData = () => {
        const cells = [];
        for (let i = 89; i >= 0; i--) {
            const d = subDays(new Date(), i);
            const ds = d.toLocaleDateString('en-CA');
            const dayData = consistencyMap[ds];
            let level = 0; // 0=no data, 1=had tasks but 0 completions, 2=partial, 3=all done
            if (dayData) {
                if (dayData.completed === 0) level = 1;
                else if (dayData.completed < dayData.total) level = 2;
                else level = 3;
            }
            cells.push({ date: ds, label: format(d, 'MMM d'), level, data: dayData });
        }
        return cells;
    };

    const heatmapData = buildHeatmapData();
    const heatmapColors = [
        'bg-slate-100 dark:bg-slate-800/50',        // 0: no data
        'bg-rose-200 dark:bg-rose-500/30',           // 1: 0% completion
        'bg-primary/40',                              // 2: partial
        'bg-primary',                                 // 3: 100%
    ];

    // ─── Hour-of-Day Productivity ─────────────────────────────────────────────
    const hourlyProductivity = (() => {
        const hours = Array.from({ length: 24 }, (_, i) => ({
            hour: `${i.toString().padStart(2, '0')}:00`,
            completed: 0, missed: 0, total: 0,
        }));
        filteredTasks.forEach(t => {
            if (t.scheduled_start_time) {
                const h = parseInt(t.scheduled_start_time.split(':')[0]);
                hours[h].total++;
                if (t.status === 'completed') hours[h].completed++;
                if (t.status === 'missed') hours[h].missed++;
            }
        });
        return hours.filter(h => h.total > 0);
    })();

    // ─── Priority Breakdown ───────────────────────────────────────────────────
    const priorityBreakdown = (() => {
        const map = { high: { total: 0, completed: 0 }, medium: { total: 0, completed: 0 }, low: { total: 0, completed: 0 } };
        filteredTasks.forEach(t => {
            const p = t.priority || 'low';
            if (map[p]) {
                map[p].total++;
                if (t.status === 'completed') map[p].completed++;
            }
        });
        return Object.entries(map).map(([key, val]) => ({
            priority: key.charAt(0).toUpperCase() + key.slice(1),
            total: val.total,
            completed: val.completed,
            rate: val.total > 0 ? Math.round((val.completed / val.total) * 100) : 0,
        }));
    })();

    // ─── Best Performing Day ──────────────────────────────────────────────────
    const bestDay = (() => {
        let best = null;
        Object.entries(consistencyMap).forEach(([date, data]) => {
            if (!best || data.points > best.points) {
                best = { date, ...data };
            }
        });
        return best;
    })();

    // ─── Recent Activity (audit logs + missed) ────────────────────────────────
    const recentItems = [
        ...filteredLogs.slice(0, 10).map(log => ({
            id: `audit-${log.id}`, type: 'audit',
            date: new Date(log.created_at), title: log.tasks?.title || 'Unknown Task',
            points: log.tasks?.points || 0, completionStatus: log.completion_status,
            performanceReason: log.performance_reason,
        })),
        ...missedTasks.slice(0, 10).map(task => ({
            id: `missed-${task.id}`, type: 'missed',
            date: new Date(task.created_at), title: task.title,
            points: task.points || 0, completionStatus: 'missed',
            performanceReason: null,
        })),
    ].sort((a, b) => b.date - a.date).slice(0, 15);

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <div className="bg-background-light dark:bg-background-dark text-charcoal dark:text-white min-h-screen flex justify-center items-start font-sans">
            <div className="w-full max-w-[430px] min-h-screen bg-background-light dark:bg-background-dark relative overflow-hidden pb-10">

                {/* ── Header ─────────────────────────────────────────────── */}
                <header className="flex items-center justify-between px-6 py-6 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white dark:bg-card-dark rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-extrabold tracking-tight">Deep Analytics</h1>
                    <div className="w-10"></div>
                </header>

                {/* ── Date Range Filter Pill Bar ──────────────────────────── */}
                <div className="px-6 mb-4">
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        {PERIOD_OPTIONS.map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => setPeriod(opt.key)}
                                className={clsx(
                                    "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200",
                                    period === opt.key
                                        ? "bg-charcoal dark:bg-white text-white dark:text-charcoal shadow-lg"
                                        : "bg-white dark:bg-charcoal text-slate-500 border border-slate-100 dark:border-slate-800"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    {period === 'custom' && (
                        <div className="flex gap-2 mt-3">
                            <div className="flex-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5 block">From</label>
                                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                                    className="w-full bg-white dark:bg-charcoal rounded-xl px-3 py-2 text-xs font-medium border border-slate-100 dark:border-slate-800 outline-none" />
                            </div>
                            <div className="flex-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5 block">To</label>
                                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                                    className="w-full bg-white dark:bg-charcoal rounded-xl px-3 py-2 text-xs font-medium border border-slate-100 dark:border-slate-800 outline-none" />
                            </div>
                        </div>
                    )}
                </div>

                {dayOffExcluded > 0 && (
                    <div className="mx-6 mb-4 flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl px-4 py-2.5">
                        <span className="text-base">🌿</span>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                            {dayOffExcluded} day-off session{dayOffExcluded !== 1 ? 's' : ''} excluded.
                        </p>
                    </div>
                )}

                <div className="px-6 space-y-8">

                    {/* ═══ SCORECARD GRID ═══════════════════════════════════════ */}
                    <section className="grid grid-cols-2 gap-3">
                        <div className="bg-primary text-charcoal p-5 rounded-[28px] flex flex-col justify-between aspect-[4/3] shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined self-end text-3xl opacity-50">speed</span>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Completion Rate</p>
                                <p className="text-4xl font-extrabold leading-none mt-1">{completionRate}%</p>
                            </div>
                        </div>
                        <div className="bg-charcoal dark:bg-zinc-900 text-white p-5 rounded-[28px] flex flex-col justify-between aspect-[4/3] shadow-lg">
                            <span className="material-symbols-outlined self-end text-3xl text-primary">local_fire_department</span>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Current Streak</p>
                                <p className="text-4xl font-extrabold leading-none mt-1">{user?.current_streak || streakData.current}<span className="text-lg ml-1">days</span></p>
                            </div>
                        </div>
                    </section>

                    {/* ═══ KEY METRICS ROW ══════════════════════════════════════ */}
                    <section className="grid grid-cols-3 gap-2">
                        <StatCard label="Points Earned" value={`+${totalPoints}`} icon="trending_up" accent="emerald" />
                        <StatCard label="Points Lost" value={`-${pointsLost}`} icon="trending_down" accent="rose" />
                        <StatCard label="Avg/Day" value={avgTasksPerDay} icon="avg_pace" accent="sky" />
                    </section>

                    <section className="grid grid-cols-3 gap-2">
                        <StatCard label="Longest Streak" value={`${streakData.longest}d`} icon="emoji_events" accent="amber" />
                        <StatCard label="Perfect Days" value={streakData.perfectDays} icon="star" accent="primary" subtitle="100% completion" />
                        <StatCard label="Active Days" value={streakData.totalActiveDays} icon="calendar_month" accent="indigo" />
                    </section>

                    {bestDay && (
                        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 rounded-2xl p-4 border border-primary/20 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">workspace_premium</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Best Day</p>
                                <p className="text-sm font-extrabold">{format(new Date(bestDay.date + 'T00:00:00'), 'EEEE, MMM d, yyyy')}</p>
                                <p className="text-[10px] text-slate-400">{bestDay.completed}/{bestDay.total} tasks • {bestDay.points} pts earned</p>
                            </div>
                        </div>
                    )}

                    {/* ═══ PRODUCTIVITY TREND CHART ═════════════════════════════ */}
                    {trendData.length > 1 && (
                        <Section title="Productivity Trend" icon="show_chart">
                            <div className="bg-white dark:bg-card-dark rounded-[28px] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="gradRate" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#A3E635" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#A3E635" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="rate" name="Completion %" stroke="#A3E635" strokeWidth={2.5} fill="url(#gradRate)" dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-6 mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                                        <span className="text-[10px] text-slate-400 font-medium">Completion Rate</span>
                                    </div>
                                </div>
                            </div>
                        </Section>
                    )}

                    {/* ═══ DAILY POINTS CHART ═══════════════════════════════════ */}
                    {trendData.length > 1 && (
                        <Section title="Points Earned vs Lost" icon="finance">
                            <div className="bg-white dark:bg-card-dark rounded-[28px] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="points" name="Points Earned" fill="#A3E635" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="missed" name="Tasks Missed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-6 mt-2">
                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-primary"></div><span className="text-[10px] text-slate-400 font-medium">Earned</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div><span className="text-[10px] text-slate-400 font-medium">Missed</span></div>
                                </div>
                            </div>
                        </Section>
                    )}

                    {/* ═══ CONSISTENCY HEATMAP ══════════════════════════════════ */}
                    <Section title="90-Day Consistency" icon="grid_view">
                        <div className="bg-white dark:bg-card-dark rounded-[28px] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}>
                                {heatmapData.map((cell, i) => (
                                    <div
                                        key={i}
                                        title={`${cell.label}: ${cell.data ? `${cell.data.completed}/${cell.data.total} tasks` : 'No tasks'}`}
                                        className={clsx(
                                            "aspect-square rounded-[3px] transition-colors cursor-default",
                                            heatmapColors[cell.level]
                                        )}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center justify-between mt-3 text-[9px] text-slate-400 font-medium">
                                <span>90 days ago</span>
                                <div className="flex items-center gap-1.5">
                                    <span>Less</span>
                                    {heatmapColors.map((c, i) => (<div key={i} className={clsx("w-3 h-3 rounded-[2px]", c)} />))}
                                    <span>More</span>
                                </div>
                                <span>Today</span>
                            </div>
                        </div>
                    </Section>

                    {/* ═══ FOCUS QUALITY ════════════════════════════════════════ */}
                    <Section title="Focus Quality" icon="psychology">
                        <div className="bg-white dark:bg-card-dark rounded-[28px] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                            {focusPieData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <PieChart>
                                            <Pie
                                                data={focusPieData}
                                                cx="50%" cy="50%"
                                                innerRadius={50} outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                                strokeWidth={0}
                                            >
                                                {focusPieData.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-3 mt-2">
                                        {Object.entries(reasonLabels).map(([key, meta]) => {
                                            const count = reasonCounts[key] || 0;
                                            if (count === 0) return null;
                                            const pct = Math.round((count / totalAudits) * 100);
                                            return (
                                                <div key={key}>
                                                    <div className="flex justify-between text-xs font-bold mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className={clsx("w-2.5 h-2.5 rounded-full", meta.bg)}></div>
                                                            <span>{meta.label}</span>
                                                        </div>
                                                        <span>{count} ({pct}%)</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                                                        <div className={`h-full rounded-full ${meta.bg}`} style={{ width: `${pct}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <p className="text-xs text-center text-slate-400 italic py-6">No focus data for this period</p>
                            )}
                        </div>
                    </Section>

                    {/* ═══ HOUR-OF-DAY PRODUCTIVITY ═════════════════════════════ */}
                    {hourlyProductivity.length > 0 && (
                        <Section title="Peak Productivity Hours" icon="schedule">
                            <div className="bg-white dark:bg-card-dark rounded-[28px] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                                <ResponsiveContainer width="100%" height={160}>
                                    <BarChart data={hourlyProductivity} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                                        <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="completed" name="Completed" fill="#A3E635" radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="missed" name="Missed" fill="#ef4444" radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">When you're most productive during the day</p>
                            </div>
                        </Section>
                    )}

                    {/* ═══ PRIORITY PERFORMANCE ═════════════════════════════════ */}
                    {priorityBreakdown.some(p => p.total > 0) && (
                        <Section title="Priority Performance" icon="flag">
                            <div className="bg-white dark:bg-card-dark rounded-[28px] p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                                {priorityBreakdown.filter(p => p.total > 0).map(p => (
                                    <div key={p.priority}>
                                        <div className="flex justify-between text-xs font-bold mb-1">
                                            <span className="flex items-center gap-2">
                                                <span className={clsx(
                                                    "w-2 h-2 rounded-full",
                                                    p.priority === 'High' ? 'bg-rose-500' :
                                                        p.priority === 'Medium' ? 'bg-amber-500' : 'bg-sky-500'
                                                )}></span>
                                                {p.priority}
                                            </span>
                                            <span>{p.completed}/{p.total} ({p.rate}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={clsx(
                                                    "h-full rounded-full",
                                                    p.priority === 'High' ? 'bg-rose-500' :
                                                        p.priority === 'Medium' ? 'bg-amber-500' : 'bg-sky-500'
                                                )}
                                                style={{ width: `${p.rate}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* ═══ TOP DISTRACTIONS ═════════════════════════════════════ */}
                    {topDistractions.length > 0 && (
                        <Section title="Distraction Analysis" icon="notifications_active">
                            <div className="bg-white dark:bg-card-dark rounded-[28px] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                                {/* Summary bar */}
                                <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-50 dark:border-white/5">
                                    <div className="flex-1 text-center">
                                        <p className="text-xl font-extrabold text-rose-500">{totalDistractionCount}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Distractions</p>
                                    </div>
                                    <div className="w-px h-8 bg-slate-100 dark:bg-white/10"></div>
                                    <div className="flex-1 text-center">
                                        <p className="text-xl font-extrabold text-rose-500">{totalDistractionTime}m</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Time Lost</p>
                                    </div>
                                </div>
                                {topDistractions.map(([cause, stats], idx) => {
                                    const pct = totalDistractionTime > 0 ? Math.round((stats.duration / totalDistractionTime) * 100) : 0;
                                    return (
                                        <div key={cause} className={idx !== topDistractions.length - 1 ? 'mb-4 pb-4 border-b border-slate-50 dark:border-white/5' : ''}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold text-xs">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">{cause}</p>
                                                        <p className="text-[10px] text-slate-400">{stats.count} times • {pct}% of total</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-bold text-rose-500">{stats.duration}m</p>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden mt-1">
                                                <div className="h-full rounded-full bg-rose-400" style={{ width: `${pct}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Section>
                    )}

                    {/* ═══ COMPLETION BREAKDOWN PIE ═════════════════════════════ */}
                    {totalAudits > 0 && (
                        <Section title="Completion Breakdown" icon="donut_large">
                            <div className="bg-white dark:bg-card-dark rounded-[28px] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-3">
                                        <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{fullyCompleted}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mt-1">Completed</p>
                                    </div>
                                    <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-3">
                                        <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{partialCompleted}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mt-1">Partial</p>
                                    </div>
                                    <div className="bg-rose-50 dark:bg-rose-500/10 rounded-2xl p-3">
                                        <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{notCompleted}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-1">Failed</p>
                                    </div>
                                </div>
                            </div>
                        </Section>
                    )}

                    {/* ═══ RECENT ACTIVITY ══════════════════════════════════════ */}
                    <Section title="Recent Activity" icon="history">
                        <div className="space-y-2">
                            {recentItems.map(item => (
                                <div key={item.id} className="bg-white dark:bg-card-dark rounded-2xl p-3.5 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <div className="max-w-[65%]">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                                            {format(item.date, 'MMM d, h:mm a')}
                                        </p>
                                        <h3 className="font-bold text-sm text-charcoal dark:text-white truncate">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={clsx(
                                                "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase",
                                                item.type === 'missed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    item.completionStatus === 'yes' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        item.completionStatus === 'half' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            )}>
                                                {item.type === 'missed' ? 'Missed' :
                                                    item.completionStatus === 'yes' ? 'Completed' :
                                                        item.completionStatus === 'half' ? 'Partial' : 'Failed'}
                                            </span>
                                            <span className={clsx(
                                                "text-[10px] font-medium",
                                                item.type === 'missed' ? "text-rose-500" : "text-slate-400"
                                            )}>
                                                {item.type === 'missed' ? `-${item.points}` : `+${item.points}`} pts
                                            </span>
                                        </div>
                                    </div>
                                    <div className={clsx(
                                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                                        item.type === 'missed'
                                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                                            : ['excellent', 'good', 'motivating'].includes(item.performanceReason)
                                                ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                                : 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
                                    )}>
                                        <span className="material-symbols-outlined text-lg">
                                            {item.type === 'missed' ? 'cancel' :
                                                ['excellent', 'good', 'motivating'].includes(item.performanceReason) ? 'thumb_up' : 'priority_high'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {recentItems.length === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    <span className="material-symbols-outlined text-3xl mb-2 block opacity-40">inbox</span>
                                    <p className="text-xs font-medium">No activity for this period</p>
                                </div>
                            )}
                        </div>
                    </Section>

                </div>
            </div>
        </div>
    );
}
