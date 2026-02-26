import React, { useState, useRef } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Navigate, useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user, tasks, signOut, loading, uploadAvatar } = useTasks();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const handleCopyLink = () => {
        const url = `${window.location.origin}/u/${user?.username}`;
        navigator.clipboard.writeText(url).then(() => {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2500);
        });
    };

    // ── Compute 7-day chart data from real tasks ──────────────────────────────
    const weeklyBars = (() => {
        const safeTasks = tasks || [];
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return days.map((label, offset) => {
            const d = new Date(today);
            d.setDate(today.getDate() - (6 - offset));
            const dateStr = d.toLocaleDateString('en-CA');

            const completed = safeTasks.filter(t =>
                t.status === 'completed' &&
                t.actual_end_time?.startsWith(dateStr)
            ).length;
            const total = safeTasks.filter(t =>
                new Date(t.created_at).toLocaleDateString('en-CA') === dateStr
            ).length;

            const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
            const isToday = dateStr === today.toLocaleDateString('en-CA');
            const dayLabel = isToday ? `${label}*` : label;

            let color;
            if (pct === 0 && total > 0) color = 'bg-rose-400';
            else if (pct === 0 && total === 0) color = 'bg-slate-300/60 dark:bg-zinc-700/60';
            else if (pct === 100) color = 'bg-primary';
            else color = 'bg-primary/60';

            return { label: dayLabel, pct, color, total };
        });
    })();

    const totalCompleted = (tasks || []).filter(t => t.status === 'completed').length;
    const tierStatus = user?.tier_status || 'Recruit';


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-slate-400">
                <span className="material-symbols-outlined animate-spin text-4xl">hg_logo</span>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        try {
            const file = event.target.files[0];
            if (!file) return;

            setUploading(true);
            await uploadAvatar(file);
        } catch (error) {
            console.error("Error uploading avatar:", error);
            alert("Failed to upload avatar. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 pb-32">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            {/* Header */}
            <header className="mt-4 mb-8">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white dark:bg-card-dark rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 mr-2">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-charcoal dark:bg-white/10 px-3 py-1 rounded-full">NoZero System</span>
                    <button onClick={() => navigate('/settings')} className="w-10 h-10 bg-white dark:bg-card-dark rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-20">
                                <span className="material-symbols-outlined animate-spin text-white">progress_activity</span>
                            </div>
                        )}
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-background-dark shadow-xl group-hover:opacity-80 transition-opacity" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-primary/20 border-4 border-white dark:border-background-dark shadow-xl flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                <span className="text-2xl font-bold text-primary-dark">{user.username?.[0]?.toUpperCase() || '?'}</span>
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-charcoal text-primary w-7 h-7 rounded-full flex items-center justify-center border-2 border-white dark:border-background-dark shadow-sm z-20">
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">{user.username}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                                {tierStatus} · Rank #{user.rank ?? '—'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-lavender dark:bg-indigo-950/40 p-3 rounded-2xl flex items-center gap-3 border border-indigo-100 dark:border-indigo-900/50">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-sm">verified_user</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">Tier Status</p>
                        <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">{tierStatus.toUpperCase()}</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Tasks Done</p>
                        <p className="text-sm font-black text-indigo-900 dark:text-indigo-200">{totalCompleted}</p>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary text-charcoal p-5 rounded-[28px] flex flex-col justify-between aspect-square border-2 border-charcoal/5">
                    <span className="material-symbols-outlined self-end text-3xl">analytics</span>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Consistency</p>
                        <p className="text-3xl font-extrabold leading-none mt-1">{user.consistency_score ?? 0}<span className="text-lg"> Pts</span></p>
                    </div>
                </div>
                <div className="bg-charcoal text-white dark:bg-card-dark p-5 rounded-[28px] flex flex-col justify-between aspect-square">
                    <span className="material-symbols-outlined self-end text-3xl text-primary">military_tech</span>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Global Rank</p>
                        <p className="text-3xl font-extrabold leading-none mt-1">#{user.rank ?? '-'}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800 p-5 rounded-[28px] flex flex-col justify-between aspect-square">
                    <span className="material-symbols-outlined self-end text-3xl text-orange-500">local_fire_department</span>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Streak</p>
                        <p className="text-3xl font-extrabold leading-none mt-1">{user.current_streak ?? 0} <span className="text-base text-slate-400">Days</span></p>
                    </div>
                </div>
                <div className="bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800 p-5 rounded-[28px] flex flex-col justify-between aspect-square">
                    <span className="material-symbols-outlined self-end text-3xl text-rose-500">cancel</span>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Missed Tasks</p>
                        <p className="text-3xl font-extrabold leading-none mt-1">{user.missed_tasks_count ?? 0} <span className="text-base text-slate-400">Total</span></p>
                    </div>
                </div>
            </div>

            {/* Weekly Audit Chart (Hardcoded Visual) */}
            <section className="bg-white dark:bg-card-dark p-6 rounded-[32px] border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h3 className="font-bold text-lg">NoZero Weekly Audit</h3>
                        <p className="text-xs text-slate-400">Last 7 days · lime = completed</p>
                    </div>
                    <div className="text-right">
                        {(() => {
                            const avg = weeklyBars.filter(b => b.total > 0).reduce((s, b) => s + b.pct, 0) / Math.max(1, weeklyBars.filter(b => b.total > 0).length);
                            const grade = avg >= 90 ? 'A+' : avg >= 75 ? 'A' : avg >= 60 ? 'B' : avg >= 40 ? 'C' : 'D';
                            return <span className="text-2xl font-black text-primary bg-charcoal px-3 py-1 rounded-xl">{grade}</span>;
                        })()}
                    </div>
                </div>

                <div className="flex items-end justify-between h-32 gap-2">
                    {weeklyBars.map((bar, idx) => (
                        <div key={idx} className="flex flex-col items-center flex-1 gap-2">
                            <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-24 relative overflow-hidden">
                                <div
                                    className={`absolute bottom-0 w-full rounded-full transition-all duration-700 ${bar.color}`}
                                    style={{ height: bar.total === 0 ? '8%' : `${Math.max(8, bar.pct)}%` }}
                                />
                            </div>
                            <span className={`text-[9px] font-bold uppercase ${bar.label.includes('*') ? 'text-primary' : 'text-slate-400'}`}>
                                {bar.label}
                            </span>
                            {bar.total > 0 && (
                                <span className="text-[8px] font-bold text-slate-300 dark:text-zinc-600">{bar.pct}%</span>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Share Profile */}
            <div className="mt-6 px-2 space-y-3">
                {/* View/Edit shareable profile */}
                <button
                    onClick={() => navigate(`/u/${user?.username}`)}
                    className="w-full bg-charcoal dark:bg-white text-white dark:text-charcoal font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
                >
                    <span className="material-symbols-outlined">open_in_new</span>
                    View My Shareable Profile
                </button>
                {/* Copy link */}
                <button
                    onClick={handleCopyLink}
                    className="w-full bg-slate-100 dark:bg-zinc-800 text-charcoal dark:text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all active:scale-[0.98]"
                >
                    <span className="material-symbols-outlined text-base">{linkCopied ? 'check_circle' : 'content_copy'}</span>
                    {linkCopied ? 'Link Copied!' : 'Copy Shareable Link'}
                </button>
                {linkCopied && (
                    <p className="text-center text-xs text-primary font-bold">
                        ✓ Anyone with this link can view your public profile
                    </p>
                )}
            </div>

            {/* Sign Out */}
            <div className="mt-3 px-2">
                <button
                    onClick={async () => { await signOut(); navigate('/login'); }}
                    className="w-full bg-danger/10 border border-danger/30 text-danger font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-danger/20 transition-colors active:scale-[0.98]"
                >
                    <span className="material-symbols-outlined">logout</span>
                    Sign Out
                </button>
            </div>


            {/* Bottom Navigation */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] z-50">
                <nav className="bg-charcoal dark:bg-zinc-900 rounded-full p-2 flex justify-between items-center shadow-2xl shadow-charcoal/20">
                    <button onClick={() => navigate('/')} className="w-14 h-14 text-white/50 flex items-center justify-center hover:text-primary transition-colors">
                        <span className="material-icons-outlined">grid_view</span>
                    </button>
                    <button onClick={() => navigate('/friends')} className="w-14 h-14 text-white/50 flex items-center justify-center hover:text-primary transition-colors">
                        <span className="material-icons-outlined">group</span>
                    </button>
                    <button onClick={() => navigate('/add-task')} className="w-14 h-14 text-white/50 flex items-center justify-center hover:text-primary transition-colors">
                        <span className="material-icons-outlined">add_circle</span>
                    </button>
                    <button onClick={() => navigate('/leaderboard')} className="w-14 h-14 text-white/50 flex items-center justify-center hover:text-primary transition-colors">
                        <span className="material-icons-outlined">emoji_events</span>
                    </button>
                    <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-charcoal shadow-sm">
                        <span className="material-icons-outlined">person</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}
