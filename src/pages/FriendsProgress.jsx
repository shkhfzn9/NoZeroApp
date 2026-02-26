import React, { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';

// Deterministic 7-bar consistency chart data derived from streak count
function getConsistencyBars(streak) {
    const bars = [];
    for (let i = 6; i >= 0; i--) {
        const dayIndex = 6 - i; // 0 = oldest, 6 = today
        const active = streak > i;
        const height = active
            ? Math.max(60, Math.min(100, 70 + Math.sin(dayIndex * 1.5) * 20 + Math.random() * 10))
            : Math.max(15, 30 + Math.sin(dayIndex) * 15);
        bars.push({ active, height });
    }
    return bars;
}

// Deterministic bar generation using streak (no random)
function getBars(streak) {
    const totalDays = 7;
    return Array.from({ length: totalDays }, (_, i) => {
        const dayFromEnd = totalDays - 1 - i; // 0 = today
        const active = streak > dayFromEnd;
        const heights = [60, 80, 100, 90, 100, 100, 100];
        const inactiveHeights = [60, 10, 60, 80, 100, 90, 100];
        const h = active ? heights[i] : inactiveHeights[i];
        return { active, height: h };
    });
}

function FriendCard({ f, onClick }) {
    const streak = f.friend?.current_streak || 0;
    const score = f.friend?.consistency_score || 0;
    const isElite = score >= 80;
    const bars = getBars(streak);

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-zinc-900 rounded-[1.5rem] p-5 shadow-sm border border-slate-100 dark:border-white/5 cursor-pointer active:scale-[0.99] transition-transform"
        >
            {/* Top row */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            {f.friend?.avatar_url ? (
                                <img src={f.friend.avatar_url} alt={f.friend.username} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500 font-black text-lg">
                                    {f.friend?.username?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        {streak > 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#80f20d] rounded-full border-2 border-white dark:border-zinc-900" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-black dark:text-white tracking-tight">
                                {f.friend?.username?.toUpperCase()}
                            </h3>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-black ${isElite ? 'bg-[#80f20d] text-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                {isElite ? 'ELITE' : 'ACTIVE'}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-bold tracking-widest">
                            SCORE {score}
                        </p>
                    </div>
                </div>
                <button className="text-slate-300 p-1">
                    <span className="material-symbols-outlined">more_horiz</span>
                </button>
            </div>

            {/* 7-day consistency chart + streak */}
            <div className="flex items-end justify-between gap-6">
                <div className="flex-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-3">
                        7-Day Consistency
                    </p>
                    <div className="flex items-end gap-1.5 h-10">
                        {bars.map((bar, idx) => (
                            <div
                                key={idx}
                                style={{ height: `${bar.height}%` }}
                                className={`flex-1 rounded-full transition-all ${bar.active
                                    ? 'bg-[#80f20d]'
                                    : 'bg-slate-200 dark:bg-slate-700'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-3xl font-black leading-none text-black dark:text-white">{streak}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-1">Day Streak</p>
                </div>
            </div>
        </div>
    );
}

export default function FriendsProgress() {
    const navigate = useNavigate();
    const {
        friends, user, loading,
        acceptFriendRequest, rejectFriendRequest,
        searchUsers, sendFriendRequest, cancelFriendRequest
    } = useTasks();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [sentIds, setSentIds] = useState(new Set());

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] dark:bg-black">
            <span className="material-symbols-outlined animate-spin text-4xl text-slate-400">hg_logo</span>
        </div>
    );
    if (!user) return <Navigate to="/login" replace />;

    const pendingRequests = friends.filter(f => f.status === 'pending' && !f.isSender);
    const sentRequests = friends.filter(f => f.status === 'pending' && f.isSender);
    const activeFriends = friends.filter(f => f.status === 'accepted');

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length >= 3) {
            setIsSearching(true);
            const results = await searchUsers(query);
            // Filter out existing friends/pending
            const existingIds = new Set(friends.map(f => f.friend?.id));
            setSearchResults(results.filter(r => !existingIds.has(r.id)));
            setIsSearching(false);
        } else {
            setSearchResults([]);
        }
    };

    const handleAddFriend = async (friendId) => {
        setSentIds(prev => new Set(prev).add(friendId));
        await sendFriendRequest(friendId);
        setSearchResults(prev => prev.filter(p => p.id !== friendId));
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] dark:bg-black font-['Space_Grotesk'] pb-32">

            {/* ── STICKY HEADER ── */}
            <header className="sticky top-0 z-50 bg-[#F5F5F5]/80 dark:bg-black/80 backdrop-blur-md px-6 pt-8 pb-4">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">Network Protocol</p>
                        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">NETWORK</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {(pendingRequests.length + sentRequests.length) > 0 && (
                            <span className="bg-[#80f20d] text-black text-[10px] font-black px-2.5 py-1 rounded-full">
                                {pendingRequests.length + sentRequests.length} PENDING
                            </span>
                        )}
                        <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-white/10">
                            <span className="material-symbols-outlined text-2xl text-black dark:text-white">qr_code_2</span>
                        </button>
                    </div>
                </div>

                {/* Search bar */}
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Find auditors..."
                        className="w-full bg-white dark:bg-zinc-900 border-none shadow-sm rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#80f20d] transition-all placeholder:text-slate-400 dark:text-white"
                    />
                </div>
            </header>

            <main className="px-6">

                {/* ── SEARCH RESULTS ── */}
                {searchQuery.length >= 3 && (
                    <section className="mt-6 mb-6">
                        <div className="flex justify-between items-center px-1 mb-3">
                            <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Search Results</h2>
                        </div>
                        {isSearching && (
                            <p className="text-sm text-slate-400 text-center py-6">Searching...</p>
                        )}
                        <div className="space-y-3">
                            {searchResults.map(profile => (
                                <div key={profile.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-500 font-black">
                                                    {profile.username?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm dark:text-white">{profile.username?.toUpperCase()}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold tracking-widest">
                                                SCORE {profile.consistency_score || 0}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAddFriend(profile.id)}
                                        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-wider rounded-xl hover:opacity-80 transition-opacity"
                                    >
                                        + Add
                                    </button>
                                </div>
                            ))}
                            {searchResults.length === 0 && !isSearching && (
                                <p className="text-center py-6 text-slate-400 text-xs font-medium">No auditors found.</p>
                            )}
                        </div>
                    </section>
                )}

                {/* ── INCOMING AUTH REQUESTS ── */}
                {pendingRequests.length > 0 && (
                    <section className="mt-6 mb-8">
                        <div className="bg-[#E6E6FA] dark:bg-indigo-950/40 rounded-[1.5rem] p-5 shadow-sm border border-[#D8D8F0] dark:border-indigo-900/50">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xs font-bold tracking-widest text-slate-600 dark:text-slate-300 uppercase">
                                    Incoming Auth Requests ({pendingRequests.length})
                                </h2>
                                <span className="bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                                    PENDING
                                </span>
                            </div>
                            <div className="space-y-3">
                                {pendingRequests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/10 overflow-hidden">
                                                {req.friend?.avatar_url ? (
                                                    <img src={req.friend.avatar_url} alt={req.friend.username} className="w-full h-full object-cover rounded-2xl" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-600 font-black">
                                                        {req.friend?.username?.[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold dark:text-white">{req.friend?.username?.toUpperCase()}</h3>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                                                    {req.friend?.consistency_score || 0} CONSISTENCY
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => acceptFriendRequest(req.id)}
                                                className="w-9 h-9 bg-white dark:bg-white/20 flex items-center justify-center rounded-xl text-black dark:text-white shadow-sm hover:scale-105 transition-transform"
                                            >
                                                <span className="material-symbols-outlined text-lg">check</span>
                                            </button>
                                            <button
                                                onClick={() => rejectFriendRequest(req.id)}
                                                className="w-9 h-9 bg-white/40 dark:bg-white/10 flex items-center justify-center rounded-xl text-slate-500 hover:scale-105 transition-transform"
                                            >
                                                <span className="material-symbols-outlined text-lg">close</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── SENT REQUESTS ── */}
                {sentRequests.length > 0 && (
                    <section className={`mb-8 ${pendingRequests.length === 0 ? 'mt-6' : ''}`}>
                        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-[1.5rem] p-5 shadow-sm border border-amber-100 dark:border-amber-900/40">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xs font-bold tracking-widest text-amber-700 dark:text-amber-400 uppercase">
                                    Sent Requests ({sentRequests.length})
                                </h2>
                                <span className="bg-amber-200/60 dark:bg-amber-400/20 text-amber-700 dark:text-amber-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                                    AWAITING
                                </span>
                            </div>
                            <div className="space-y-3">
                                {sentRequests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-100/60 dark:bg-amber-400/10 overflow-hidden">
                                                {req.friend?.avatar_url ? (
                                                    <img src={req.friend.avatar_url} alt={req.friend?.username} className="w-full h-full object-cover rounded-2xl" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-amber-700 dark:text-amber-400 font-black">
                                                        {req.friend?.username?.[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold dark:text-white">{req.friend?.username?.toUpperCase()}</h3>
                                                <p className="text-[10px] text-amber-500 font-bold">Request pending...</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => cancelFriendRequest(req.id)}
                                            className="px-3 py-1.5 bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-xl hover:opacity-80 transition-opacity"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── ACTIVE NETWORK TRACKING ── */}
                <section className={`space-y-4 ${(pendingRequests.length + sentRequests.length) === 0 ? 'mt-6' : ''}`}>
                    {activeFriends.length > 0 && (
                        <div className="flex justify-between items-center px-1">
                            <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Active Network Tracking</h2>
                            <span className="text-xs font-bold text-slate-400">{activeFriends.length}</span>
                        </div>
                    )}

                    {activeFriends.map(f => (
                        <FriendCard
                            key={f.id}
                            f={f}
                            onClick={() => navigate(`/friend/${f.friend.id}`)}
                        />
                    ))}

                    {activeFriends.length === 0 && pendingRequests.length === 0 && sentRequests.length === 0 && searchQuery.length < 3 && (
                        <div className="text-center py-16">
                            <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-800 mb-3 block">hub</span>
                            <p className="text-sm text-slate-400 font-bold">No connections yet.</p>
                            <p className="text-xs text-slate-400 mt-1">Search for auditors above to connect.</p>
                        </div>
                    )}
                </section>

            </main>

            {/* ── BOTTOM NAVIGATION ── */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] z-50">
                <nav className="bg-charcoal dark:bg-zinc-900 rounded-full p-2 flex justify-between items-center shadow-2xl shadow-charcoal/20">
                    <button onClick={() => navigate('/')} className="w-14 h-14 text-white/50 flex items-center justify-center hover:text-primary transition-colors">
                        <span className="material-icons-outlined">grid_view</span>
                    </button>
                    <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-charcoal shadow-sm">
                        <span className="material-icons-outlined">group</span>
                    </button>
                    <button onClick={() => navigate('/add-task')} className="w-14 h-14 text-white/50 flex items-center justify-center hover:text-primary transition-colors">
                        <span className="material-icons-outlined">add_circle</span>
                    </button>
                    <button onClick={() => navigate('/leaderboard')} className="w-14 h-14 text-white/50 flex items-center justify-center hover:text-primary transition-colors">
                        <span className="material-icons-outlined">emoji_events</span>
                    </button>
                    <button onClick={() => navigate('/profile')} className="w-14 h-14 text-white/50 flex items-center justify-center hover:text-primary transition-colors">
                        <span className="material-icons-outlined">person</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}
