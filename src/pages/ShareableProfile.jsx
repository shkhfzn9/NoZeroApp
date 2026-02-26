import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// ── Helpers// Build a 154-cell consistency grid with 4 states:
//  'done'     → lime  : at least one task completed that day
//  'missed'   → red   : had tasks but none completed
//  'empty'    → grey  : in account period, no tasks scheduled
//  'inactive' → grey  : before account was created, or future date
function buildGrid(tasks, accountCreatedAt) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Normalize account creation to midnight local time
    const accountStart = new Date(accountCreatedAt);
    accountStart.setHours(0, 0, 0, 0);
    // Graph starts the day AFTER account creation
    const graphStart = new Date(accountStart);
    graphStart.setDate(accountStart.getDate() + 1);

    // Build lookup maps by date string
    const completedDates = new Set();
    const taskedDates = new Set(); // any task existed this day

    tasks.forEach((t) => {
        const taskDate = new Date(t.created_at).toLocaleDateString('en-CA');
        taskedDates.add(taskDate);
        if (t.status === 'completed') {
            // Use actual_end_time if available, else created_at
            const doneDate = t.actual_end_time
                ? new Date(t.actual_end_time).toLocaleDateString('en-CA')
                : taskDate;
            completedDates.add(doneDate);
        }
    });

    const cells = [];
    for (let i = 146; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toLocaleDateString('en-CA');
        const isFuture = d > today;
        const isBeforeAccount = d < graphStart;

        let type;
        if (isFuture || isBeforeAccount) {
            type = 'inactive';
        } else if (completedDates.has(key)) {
            type = 'done';
        } else if (taskedDates.has(key)) {
            type = 'missed';
        } else {
            type = 'empty';
        }

        cells.push({ date: key, type, dow: d.getDay() }); // 0=Sun,1=Mon,...
    }
    return cells;
}

const PLATFORM_ICONS = [
    { label: 'Video Vlog', icon: 'play_circle', color: 'text-lavender', bg: 'bg-lavender/10' },
    { label: 'Social Post / Thread', icon: 'post_add', color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Blog / Article', icon: 'article', color: 'text-lavender', bg: 'bg-lavender/10' },
    { label: 'Podcast / Audio', icon: 'headphones', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Screenshot / Image', icon: 'image', color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { label: 'Other Link', icon: 'link', color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-zinc-800' },
];

function getPlatformMeta(iconName) {
    return PLATFORM_ICONS.find(p => p.icon === iconName) || PLATFORM_ICONS[PLATFORM_ICONS.length - 1];
}

// ── Add Proof Modal ───────────────────────────────────────────────────────────
function AddProofModal({ editingProof, onSave, onDelete, onClose, userId }) {
    const [label, setLabel] = useState(editingProof?.label || '');
    const [url, setUrl] = useState(editingProof?.url || '');
    const [icon, setIcon] = useState(editingProof?.icon || 'play_circle');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!label.trim() || !url.trim()) return;
        setSaving(true);
        if (editingProof?.id) {
            await supabase.from('social_proofs').update({ label, url, icon, updated_at: new Date().toISOString() }).eq('id', editingProof.id);
        } else {
            await supabase.from('social_proofs').insert([{ user_id: userId, label, url, icon }]);
        }
        setSaving(false);
        onSave();
    };

    const handleDelete = async () => {
        if (!editingProof?.id) return;
        await supabase.from('social_proofs').delete().eq('id', editingProof.id);
        onDelete();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-t-[32px] w-full max-w-md p-6 pb-10 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-extrabold">{editingProof?.id ? 'Edit Proof' : 'Add Social Proof'}</h2>
                    <button onClick={onClose} className="w-9 h-9 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Link Type Picker */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Type</p>
                <div className="flex gap-2 flex-wrap mb-5">
                    {PLATFORM_ICONS.map((p) => (
                        <button
                            key={p.icon}
                            onClick={() => setIcon(p.icon)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border-2 transition-all ${icon === p.icon
                                ? 'border-primary bg-primary/10'
                                : 'border-transparent bg-slate-100 dark:bg-zinc-800 text-slate-500'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-base ${icon === p.icon ? 'text-primary' : p.color}`}>{p.icon}</span>
                            <span className="hidden sm:inline">{p.label}</span>
                        </button>
                    ))}
                </div>

                {/* Label */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Label</p>
                <input
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    placeholder="e.g. Daily Discipline Vlog"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm font-medium mb-4 outline-none focus:border-primary transition-colors"
                />

                {/* URL */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Link / URL</p>
                <input
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    type="url"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm font-medium mb-6 outline-none focus:border-primary transition-colors"
                />

                <div className="flex gap-3">
                    {editingProof?.id && (
                        <button
                            onClick={handleDelete}
                            className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center shrink-0 active:scale-95"
                        >
                            <span className="material-symbols-outlined text-rose-500">delete</span>
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving || !label.trim() || !url.trim()}
                        className="flex-1 bg-charcoal dark:bg-white text-white dark:text-charcoal py-3.5 rounded-2xl font-extrabold text-sm active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {saving ? 'Saving…' : editingProof?.id ? 'Update' : 'Add Proof'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ShareableProfile() {
    const { username } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [proofs, setProofs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [copied, setCopied] = useState(false);

    // Auth state — who is currently viewing?
    const [viewerUser, setViewerUser] = useState(null);
    const [viewerAuthChecked, setViewerAuthChecked] = useState(false);

    // Edit mode modal state
    const [showModal, setShowModal] = useState(false);
    const [editingProof, setEditingProof] = useState(null); // null = new

    // Friend request state
    const [friendStatus, setFriendStatus] = useState(null); // null | 'pending' | 'accepted'
    const [sendingFR, setSendingFR] = useState(false);

    // ── Check who is viewing ──
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setViewerUser(data?.session?.user ?? null);
            setViewerAuthChecked(true);
        });
    }, []);

    // ── Load profile data ──
    const loadProfile = useCallback(async () => {
        setLoading(true);
        const { data: profileData, error } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, consistency_score, current_streak, rank, tier_status, total_points, missed_tasks_count, created_at')
            .eq('username', username)
            .single();

        if (error || !profileData) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        setProfile(profileData);

        const [tasksRes, proofsRes] = await Promise.all([
            supabase.from('tasks').select('status, created_at').eq('user_id', profileData.id).order('created_at', { ascending: false }).limit(500),
            supabase.from('social_proofs').select('*').eq('user_id', profileData.id).order('created_at', { ascending: true }),
        ]);

        setTasks(tasksRes.data || []);
        setProofs(proofsRes.data || []);
        setLoading(false);
    }, [username]);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    // ── Check friendship status ──
    useEffect(() => {
        if (!viewerAuthChecked || !viewerUser || !profile) return;
        if (viewerUser.id === profile.id) return; // own profile

        supabase
            .from('friends')
            .select('status')
            .or(`and(user_id.eq.${viewerUser.id},friend_id.eq.${profile.id}),and(user_id.eq.${profile.id},friend_id.eq.${viewerUser.id})`)
            .limit(1)
            .single()
            .then(({ data }) => {
                setFriendStatus(data?.status ?? null);
            });
    }, [viewerUser, profile, viewerAuthChecked]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    const handleAddFriend = async () => {
        if (!viewerUser) {
            navigate(`/signup?redirect=/u/${username}`);
            return;
        }
        setSendingFR(true);
        await supabase.from('friends').insert([{ user_id: viewerUser.id, friend_id: profile.id, status: 'pending' }]);
        setFriendStatus('pending');
        setSendingFR(false);
    };

    const handleSaveProof = () => {
        setShowModal(false);
        setEditingProof(null);
        loadProfile();
    };

    if (loading || !viewerAuthChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark px-8 text-center">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">person_off</span>
                <h1 className="text-2xl font-extrabold mb-2">Operator Not Found</h1>
                <p className="text-slate-400 text-sm mb-6">The profile for <span className="font-bold">@{username}</span> doesn't exist.</p>
                <Link to="/" className="px-6 py-3 bg-charcoal text-white rounded-full font-bold text-sm">Back to NoZero</Link>
            </div>
        );
    }

    const isOwner = viewerUser?.id === profile.id;
    const grid = buildGrid(tasks, profile.created_at);
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const score = profile.consistency_score ?? 0;
    const streak = profile.current_streak ?? 0;
    const rank = profile.rank ?? 0;
    const tierStatus = profile.tier_status || 'Recruit';
    const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const consistencyPct = score > 100 ? '99.9%' : `${Math.min(100, score).toFixed(1)}%`;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-charcoal dark:text-white font-sans pb-16">

            <main className="pt-4 pb-10 px-5 max-w-md mx-auto space-y-4">

                {/* ── OWNER BANNER ── */}
                {isOwner && (
                    <div className="bg-charcoal text-white rounded-[24px] px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">edit</span>
                            <span className="text-sm font-bold">Your public profile</span>
                        </div>
                        <button onClick={() => navigate('/profile')} className="text-[11px] font-bold text-white/60 hover:text-primary transition-colors">← Back to Profile</button>
                    </div>
                )}

                {/* ── PROFILE HEADER (name/avatar only) ── */}
                <section className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-sm border border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {profile.avatar_url ? (
                                    <img alt={profile.username} className="w-16 h-16 rounded-full object-cover border-2 border-primary" src={profile.avatar_url} />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                                        <span className="text-2xl font-extrabold text-primary">{profile.username?.[0]?.toUpperCase()}</span>
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 bg-primary text-charcoal p-1 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[14px] font-bold">verified</span>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold tracking-tight">{profile.username}</h1>
                                <p className="text-[10px] text-slate-400 mt-1 font-medium">Member since {memberSince}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleCopyLink}
                            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-slate-100 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                            title="Copy shareable link"
                        >
                            <span className={`material-symbols-outlined text-xl ${copied ? 'text-primary' : ''}`}>
                                {copied ? 'check_circle' : 'share'}
                            </span>
                        </button>
                    </div>
                    {copied && (
                        <div className="mt-4 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-4 py-2 rounded-2xl text-center">
                            ✓ Link copied to clipboard!
                        </div>
                    )}
                </section>

                {/* ── STREAK CARD ── */}
                <section>
                    <div className="bg-charcoal dark:bg-zinc-800 text-white rounded-[32px] p-6 flex items-center justify-between overflow-hidden relative border border-white/5">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Current Streak</p>
                            <h3 className="text-4xl font-black">{streak} <span className="text-sm font-medium text-zinc-400">Days</span></h3>
                        </div>
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-charcoal transform rotate-12 relative z-10">
                            <span className="material-symbols-outlined text-3xl font-bold">local_fire_department</span>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
                    </div>
                </section>

                {/* ── CONSISTENCY HEAT GRAPH ── */}
                <section className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-sm border border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold">Annual Consistency</h2>
                            <p className="text-xs text-zinc-400">Since day 1</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <span className="text-[10px] font-bold uppercase">Active</span>
                        </div>
                    </div>
                    {/* MTWTFSS × 3 header (21 columns) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(21, 1fr)', gap: '3px', marginBottom: '3px' }}>
                        {Array.from({ length: 21 }, (_, i) => {
                            const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                            return (
                                <div key={i} className="flex items-center justify-center h-4">
                                    <span className="text-[7px] font-black text-zinc-400">{DOW[i % 7]}</span>
                                </div>
                            );
                        })}
                    </div>
                    {/* 21-col × 7-row row-flow */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(21, 1fr)',
                        gap: '3px',
                    }}>
                        {grid.map((cell, i) => {
                            const cls =
                                cell.type === 'done' ? 'bg-primary' :
                                    cell.type === 'missed' ? 'bg-rose-500 opacity-75' :
                                        cell.type === 'empty' ? 'bg-zinc-400 dark:bg-zinc-600' :
                                /* inactive */           'bg-zinc-300 dark:bg-zinc-700';
                            const label =
                                cell.type === 'done' ? '✓ Done' :
                                    cell.type === 'missed' ? '✗ Missed' :
                                        cell.type === 'empty' ? 'No tasks' : 'Inactive';
                            return (
                                <div
                                    key={i}
                                    title={`${cell.date} · ${label}`}
                                    className={cls}
                                    style={{ aspectRatio: '1', borderRadius: '3px' }}
                                />
                            );
                        })}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3.5 h-3.5 rounded-sm bg-zinc-400 dark:bg-zinc-600"></div>
                            <div className="w-3.5 h-3.5 rounded-sm bg-rose-500 opacity-75"></div>
                            <div className="w-3.5 h-3.5 rounded-sm bg-primary"></div>
                        </div>
                        <p className="text-[11px] font-bold italic text-primary">
                            {profile.rank_label ? `Rank ${profile.rank_label}` : 'Rank E'} · {profile.tier_status ?? 'Unranked'}
                        </p>
                    </div>
                </section>

                {/* ── STATS GRID ── */}
                <section className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-sm border border-black/5 dark:border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Performance Stats</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prestige Rank</p>
                            <p className="text-2xl font-extrabold text-primary">{profile.rank_label ?? 'E'}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Tier</p>
                            <p className="text-2xl font-extrabold">{profile.tier_status ?? 'Unranked'}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">30d Score</p>
                            <p className="text-2xl font-extrabold">{profile.active_30_day_score ?? 0}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Audit Score</p>
                            <p className="text-2xl font-extrabold">{Math.round(profile.total_points ?? score)}</p>
                        </div>
                    </div>
                </section>

                {/* ── SOCIAL PROOF & DOCUMENTATION ── */}
                <section className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-sm border border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xs font-black uppercase tracking-[0.15em] text-zinc-400">
                            Social Proof &amp; Documentation
                        </h2>
                        {isOwner && (
                            <button
                                onClick={() => { setEditingProof(null); setShowModal(true); }}
                                className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                            >
                                <span className="material-symbols-outlined text-charcoal text-base font-bold">add</span>
                            </button>
                        )}
                    </div>

                    {proofs.length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                            {isOwner ? (
                                <>
                                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-40">add_link</span>
                                    <p className="text-xs font-medium">No proof links yet.</p>
                                    <button
                                        onClick={() => { setEditingProof(null); setShowModal(true); }}
                                        className="mt-3 px-5 py-2 bg-charcoal text-white rounded-full text-xs font-bold"
                                    >
                                        + Add Your First Link
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">link_off</span>
                                    <p className="text-xs font-medium">No documentation shared yet</p>
                                </>
                            )}
                        </div>
                    )}

                    <div className="space-y-3">
                        {proofs.map((proof) => {
                            const meta = getPlatformMeta(proof.icon);
                            return (
                                <div key={proof.id} className="flex items-center justify-between bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full ${meta.bg} flex items-center justify-center`}>
                                            <span className={`material-symbols-outlined ${meta.color} font-bold`}>{proof.icon}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold">{proof.label}</p>
                                                <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-tighter">[AUDITED]</span>
                                            </div>
                                            <a
                                                href={proof.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-sky-500 font-medium truncate block max-w-[180px] hover:underline"
                                            >
                                                {proof.url}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isOwner ? (
                                            <button
                                                onClick={() => { setEditingProof(proof); setShowModal(true); }}
                                                className="w-8 h-8 bg-slate-100 dark:bg-zinc-700 rounded-full flex items-center justify-center active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                        ) : (
                                            <a href={proof.url} target="_blank" rel="noopener noreferrer">
                                                <div className="w-6 h-6 bg-primary rounded-[6px] flex items-center justify-center shadow-sm">
                                                    <span className="material-symbols-outlined text-charcoal text-[14px] font-black">open_in_new</span>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── STATS GRID ── */}
                <section className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-black/5 dark:border-white/5 shadow-sm">
                        <div className="w-10 h-10 bg-lavender/20 text-lavender rounded-xl flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined">fact_check</span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Tasks Done</p>
                        <h3 className="text-2xl font-black">{completedCount}</h3>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-black/5 dark:border-white/5 shadow-sm">
                        <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined">trophy</span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Global Rank</p>
                        <h3 className="text-2xl font-black">#{rank || '—'}</h3>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-black/5 dark:border-white/5 shadow-sm">
                        <div className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined">cancel</span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Tasks Missed</p>
                        <h3 className="text-2xl font-black">{profile.missed_tasks_count ?? 0}</h3>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-black/5 dark:border-white/5 shadow-sm">
                        <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined">local_fire_department</span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Day Streak</p>
                        <h3 className="text-2xl font-black">{streak}</h3>
                    </div>
                </section>

                {/* ── TIER BADGE ── */}
                <section className="bg-lavender dark:bg-zinc-800 rounded-[32px] p-6 flex items-center gap-5">
                    <div className="flex -space-x-3">
                        {['bolt', 'stars', 'military_tech'].map(icon => (
                            <div key={icon} className="w-12 h-12 rounded-full bg-white/20 border-2 border-lavender flex items-center justify-center backdrop-blur-md">
                                <span className="material-symbols-outlined text-white">{icon}</span>
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="text-charcoal dark:text-white text-sm font-bold">{tierStatus} Level</p>
                        <p className="text-charcoal/70 dark:text-white/70 text-xs mt-0.5">{completedCount} audits on NoZero</p>
                    </div>
                </section>

                {/* ── ADD AS FRIEND (visitor only) ── */}
                {!isOwner && (
                    <section className="pt-2">
                        {friendStatus === 'accepted' ? (
                            <div className="w-full bg-primary/10 border border-primary/20 text-primary py-5 px-8 rounded-full font-black text-base flex items-center justify-center gap-3">
                                <span className="material-symbols-outlined">group</span>
                                Already Friends
                            </div>
                        ) : friendStatus === 'pending' ? (
                            <div className="w-full bg-slate-100 dark:bg-zinc-800 text-slate-400 py-5 px-8 rounded-full font-black text-base flex items-center justify-center gap-3">
                                <span className="material-symbols-outlined">pending</span>
                                Request Sent
                            </div>
                        ) : (
                            <button
                                onClick={handleAddFriend}
                                disabled={sendingFR}
                                className="w-full bg-charcoal dark:bg-white text-white dark:text-charcoal py-5 px-8 rounded-full font-black text-lg flex items-center justify-between shadow-xl active:scale-[0.98] transition-all group disabled:opacity-60"
                            >
                                <span>{sendingFR ? 'Sending…' : 'Add as Friend'}</span>
                                <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                                    <span className="material-symbols-outlined text-charcoal font-bold">person_add</span>
                                </div>
                            </button>
                        )}
                    </section>
                )}

                {/* ── COPY LINK CTA (owner) ── */}
                {isOwner && (
                    <section className="pt-2">
                        <button
                            onClick={handleCopyLink}
                            className="w-full bg-charcoal dark:bg-white text-white dark:text-charcoal py-5 px-8 rounded-full font-black text-base flex items-center justify-between shadow-xl active:scale-[0.98] transition-all group"
                        >
                            <span>{copied ? 'Link Copied!' : 'Copy Shareable Link'}</span>
                            <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <span className="material-symbols-outlined text-charcoal font-bold">{copied ? 'check' : 'link'}</span>
                            </div>
                        </button>
                    </section>
                )}

                {/* ── FOOTER LINKS ── */}
                <div className="flex items-center justify-center gap-4 pt-2 pb-4">
                    <Link
                        to="/signup"
                        className="text-xs text-zinc-400 hover:text-primary transition-colors font-medium"
                    >
                        Create Account
                    </Link>
                    <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
                    <Link
                        to="/what-is-nozero"
                        className="text-xs text-zinc-400 hover:text-primary transition-colors font-medium"
                    >
                        What is NoZero?
                    </Link>
                </div>

                <p className="text-center text-xs text-slate-400 pb-2">
                    Verified by <span className="font-bold text-primary">NoZero</span> · Discipline Audit System
                </p>

            </main>

            {/* ── ADD / EDIT PROOF MODAL ── */}
            {showModal && (
                <AddProofModal
                    editingProof={editingProof}
                    userId={profile.id}
                    onSave={handleSaveProof}
                    onDelete={handleSaveProof}
                    onClose={() => { setShowModal(false); setEditingProof(null); }}
                />
            )}
        </div>
    );
}
