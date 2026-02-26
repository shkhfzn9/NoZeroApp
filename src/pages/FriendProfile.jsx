import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import clsx from 'clsx';

export default function FriendProfile() {
    const { friendId } = useParams();
    const navigate = useNavigate();
    const { friends, fetchFriendTasks } = useTasks();
    const [friendTasks, setFriendTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const friend = friends.find(f => f.friend.id === friendId)?.friend;

    useEffect(() => {
        if (friendId) {
            fetchFriendTasks(friendId).then(data => {
                setFriendTasks(data);
                setLoading(false);
            });
        }
    }, [friendId, fetchFriendTasks]);

    if (!friend) return <div className="p-6 text-center">Friend not found.</div>;

    return (
        <div className="p-6 pb-32 min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-['Space_Grotesk']">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold">Auditor Profile</h1>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-sm mb-8 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-24 h-24 rounded-full bg-slate-200 mx-auto mb-4 overflow-hidden border-4 border-slate-50 dark:border-zinc-800">
                        {friend.avatar_url ? (
                            <img src={friend.avatar_url} alt={friend.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl text-slate-400 font-bold">{friend.username[0]}</div>
                        )}
                    </div>
                    <h2 className="text-2xl font-black mb-1">{friend.username}</h2>
                    <div className="flex justify-center gap-2 mb-6">
                        <span className="bg-primary/20 text-primary-dark px-2 py-0.5 rounded text-[10px] font-black uppercase">Level {Math.floor(friend.total_points / 100) || 1}</span>
                        <span className="bg-slate-100 dark:bg-zinc-800 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black uppercase">Rank #{friend.rank || '-'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl">
                            <p className="text-3xl font-black text-primary">{friend.consistency_score}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Consistency</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl">
                            <p className="text-3xl font-black text-charcoal dark:text-white">{friend.current_streak}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Day Streak</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Recent Protocols</h3>

            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-10 text-slate-400 text-xs">Loading audit logs...</div>
                ) : friendTasks.length > 0 ? (
                    friendTasks.map(task => (
                        <div key={task.id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <div>
                                <h4 className={clsx("font-bold text-sm", task.status === 'completed' ? "text-slate-900 dark:text-white" : "text-slate-400 line-through")}>
                                    {task.title}
                                </h4>
                                <p className="text-[10px] text-slate-400 mt-1">{new Date(task.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className={clsx(
                                "px-2 py-1 rounded text-[10px] font-black uppercase",
                                task.status === 'completed' ? "bg-primary/20 text-primary-dark" : "bg-red-100 text-red-500"
                            )}>
                                {task.status === 'completed' ? `+${task.points} PTS` : 'MISSED'}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-400 text-xs">No recent activity found.</div>
                )}
            </div>
        </div>
    );
}
