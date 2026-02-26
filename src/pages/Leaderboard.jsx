import React, { useState } from 'react';
import clsx from 'clsx';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';

export default function Leaderboard() {
    const { leaderboard, user, loading, fetchLeaderboard, fetchLoserboard } = useTasks();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('elite'); // 'elite', 'regional', 'friends', 'loserboard'
    const [loserboardData, setLoserboardData] = useState([]);

    React.useEffect(() => {
        if (activeTab === 'loserboard') {
            fetchLoserboard().then(data => setLoserboardData(data));
        } else {
            fetchLeaderboard();
        }
    }, [activeTab, fetchLeaderboard, fetchLoserboard]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl">hg_logo</span>
        </div>
    );
    if (!user) return <Navigate to="/login" replace />;

    // Mock losers for now if leaderboard data doesn't have status (it won't initially)
    // We'll filter leaderboard for different tabs

    return (
        <div className="p-6 pb-32">
            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-2xl font-[800] tracking-tight">NoZero</span>
                        <span className="text-[10px] bg-charcoal dark:bg-primary text-white dark:text-slate-900 px-1.5 py-0.5 rounded font-black mt-1 uppercase tracking-tighter">Audit</span>
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-[0.15em] text-slate-500 dark:text-slate-400 mt-0.5">Discipline Performance Audit</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-800">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="material-symbols-outlined text-charcoal">person</span>
                    )}
                </div>
            </header>

            {/* Your Rank Card */}
            <section className="mb-6">
                <div className="bg-charcoal dark:bg-card-dark rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Your Prestige Rank</span>
                            <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">{user?.tier_status ?? 'Unranked'}</span>
                        </div>
                        <div className="flex items-baseline gap-3">
                            <h3 className="text-5xl font-extrabold italic text-primary">{user?.rank_label ?? 'E'}</h3>
                            <div className="flex flex-col">
                                <span className="text-slate-300 font-bold text-sm">Active 30d: <span className="text-white">{user?.active_30_day_score ?? 0}</span></span>
                                <span className="text-slate-400 text-xs">#{leaderboard.findIndex(p => p.id === user?.id) + 1 || '-'} globally</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="material-symbols-outlined text-orange-400 text-sm">local_fire_department</span>
                            <span className="text-orange-400 text-xs font-bold">{user?.current_streak ?? 0} day streak</span>
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
                </div>
            </section>

            {/* Tabs */}
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex mb-6 overflow-x-auto scrollbar-hide">
                {['Elite Tier', 'Regional', 'Friends', 'Loserboard'].map((tab) => {
                    const key = tab.toLowerCase().replace(' ', '');
                    return (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={clsx(
                                "flex-1 whitespace-nowrap py-2 px-3 text-xs font-bold rounded-xl transition-all",
                                activeTab === key
                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            {tab}
                        </button>
                    );
                })}
            </div>

            {/* Loserboard Warning */}
            {activeTab === 'loserboard' && (
                <div className="bg-danger dark:bg-red-600 rounded-2xl p-4 mb-8 flex items-center gap-3 shadow-lg shadow-red-500/20 animate-pulse">
                    <span className="material-symbols-outlined text-white text-3xl font-bold">warning</span>
                    <div>
                        <h4 className="text-white text-xs font-black uppercase tracking-widest">Immediate Alert</h4>
                        <p className="text-white text-[13px] font-bold leading-tight">ACCOUNTS AT RISK</p>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-3">
                {(activeTab === 'loserboard' ? loserboardData : leaderboard).map((profile, index) => (
                    <div key={profile.id} className={clsx(
                        "grid grid-cols-12 items-center p-4 border rounded-2xl shadow-sm",
                        activeTab === 'loserboard'
                            ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30"
                            : "bg-white dark:bg-card-dark border-slate-100 dark:border-white/5"
                    )}>
                        <div className={clsx(
                            "col-span-2 font-black text-xl italic",
                            activeTab === 'loserboard' ? "text-red-300" : "text-slate-300"
                        )}>#{index + 1}</div>
                        <div className="col-span-7 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">{profile.username?.[0]}</div>
                                )}
                            </div>
                            <span className="font-bold truncate text-sm text-slate-900 dark:text-white">{profile.username}</span>
                        </div>
                        <div className="col-span-3 flex flex-col items-end gap-0.5">
                            {activeTab === 'loserboard' ? (
                                <>
                                    <span className="text-xs font-black text-red-500">{profile.consistency_score} PTS</span>
                                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">PENALIZED</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-xs font-black text-primary">{profile.rank_label ?? 'E'}</span>
                                    <span className="text-[9px] font-bold text-slate-400">{profile.tier_status ?? 'Unranked'}</span>
                                    <div className="flex items-center gap-0.5">
                                        <span className="material-symbols-outlined text-[9px] text-orange-400">local_fire_department</span>
                                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">{profile.current_streak}d</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {(activeTab === 'loserboard' ? loserboardData : leaderboard).length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-xs">
                        {activeTab === 'loserboard' ? "No penalties today. Good job!" : "No active users found."}
                    </div>
                )}
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
                    <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-charcoal shadow-sm">
                        <span className="material-icons-outlined">emoji_events</span>
                    </button>
                    <button onClick={() => navigate('/profile')} className="w-14 h-14 text-white/50 flex items-center justify-center hover:text-primary transition-colors">
                        <span className="material-icons-outlined">person</span>
                    </button>
                </nav>
            </div>
        </div >
    );
}
