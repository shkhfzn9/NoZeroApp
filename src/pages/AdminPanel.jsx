import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTasks } from '../hooks/useTasks';

const TIER_OPTIONS = ['Unranked', 'Tier 10', 'Tier 9', 'Tier 8', 'Tier 7', 'Tier 6', 'Tier 5', 'Tier 4', 'Tier 3', 'Tier 2', 'Tier 1'];
const RANK_OPTIONS = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SS+', 'SSS', 'SSS+'];

const StatCard = ({ label, value, icon, color = 'text-primary' }) => (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
            <span className={`material-symbols-outlined text-xl ${color}`}>{icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
        </div>
        <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </div>
);

export default function AdminPanel() {
    const { user, loading } = useTasks();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ email: '', password: '', username: '' });
    const [addError, setAddError] = useState('');
    const [adding, setAdding] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [tab, setTab] = useState('users'); // 'users' | 'stats' | 'feedback'
    const [successMsg, setSuccessMsg] = useState('');
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 20;

    // Feedback state
    const [feedbackList, setFeedbackList] = useState([]);
    const [loadingFeedback, setLoadingFeedback] = useState(false);
    const [feedbackLoaded, setFeedbackLoaded] = useState(false);

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const fetchFeedback = useCallback(async () => {
        setLoadingFeedback(true);
        try {
            const { data, error } = await supabase
                .from('feedback')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);
            if (error) throw error;
            setFeedbackList(data || []);
            setFeedbackLoaded(true);
        } catch (e) {
            console.error('Feedback fetch error:', e);
        } finally {
            setLoadingFeedback(false);
        }
    }, []);

    // Load feedback when tab switches to it
    useEffect(() => {
        if (tab === 'feedback' && !feedbackLoaded) fetchFeedback();
    }, [tab, feedbackLoaded, fetchFeedback]);

    const fetchUsers = useCallback(async () => {
        setLoadingUsers(true);
        try {
            const { data, error } = await supabase.rpc('admin_list_users', {
                p_search: search,
                p_limit: PAGE_SIZE,
                p_offset: page * PAGE_SIZE,
            });
            if (error) throw error;
            setUsers(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingUsers(false);
        }
    }, [search, page]);

    const [showAdminPass, setShowAdminPass] = useState(false);
    const [showAddPass, setShowAddPass] = useState(false);
    const [adminLoginEmail, setAdminLoginEmail] = useState('admin321@gmail.com');
    const [adminLoginPass, setAdminLoginPass] = useState('');
    const [adminLoginError, setAdminLoginError] = useState('');
    const [adminLoginLoading, setAdminLoginLoading] = useState(false);

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setAdminLoginError('');
        setAdminLoginLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: adminLoginEmail,
            password: adminLoginPass,
        });
        setAdminLoginLoading(false);
        if (error) { setAdminLoginError(error.message); return; }
        // Refetch will happen via TaskContext auth listener
    };

    useEffect(() => {
        if (!loading && user?.is_admin) {
            fetchUsers();
        }
    }, [user, loading, fetchUsers]);

    // Stats derived from users list — exclude admin accounts
    const nonAdminUsers = users.filter(u => !u.is_admin);
    const totalUsers = nonAdminUsers.length;
    const activeToday = nonAdminUsers.filter(u => u.last_success_date === new Date().toISOString().split('T')[0]).length;
    const penalizedToday = nonAdminUsers.filter(u => u.last_penalty_date === new Date().toISOString().split('T')[0]).length;
    const recentNew = nonAdminUsers.filter(u => {
        const diff = (Date.now() - new Date(u.created_at)) / 86400000;
        return diff <= 7;
    }).length;

    // ── Edit user ─────────────────────────────────────────────────────────────
    const openEdit = (u) => {
        setEditingUser(u);
        setEditForm({
            username: u.username ?? '',
            current_streak: u.current_streak ?? 0,
            consistency_score: u.consistency_score ?? 0,
            active_30_day_score: u.active_30_day_score ?? 0,
            tier_status: u.tier_status ?? 'Unranked',
            rank_label: u.rank_label ?? 'E',
            lifetime_tier1_count: u.lifetime_tier1_count ?? 0,
            missed_tasks_count: u.missed_tasks_count ?? 0,
            total_points: u.total_points ?? 0,
        });
    };

    const saveEdit = async () => {
        setSaving(true);
        const { error } = await supabase.rpc('admin_update_profile', {
            p_target_user_id: editingUser.id,
            p_username: editForm.username,
            p_current_streak: Number(editForm.current_streak),
            p_consistency_score: Number(editForm.consistency_score),
            p_active_30_day_score: Number(editForm.active_30_day_score),
            p_tier_status: editForm.tier_status,
            p_rank_label: editForm.rank_label,
            p_lifetime_tier1_count: Number(editForm.lifetime_tier1_count),
            p_missed_tasks_count: Number(editForm.missed_tasks_count),
            p_total_points: Number(editForm.total_points),
        });
        setSaving(false);
        if (error) { alert(error.message); return; }
        setEditingUser(null);
        showSuccess('User updated successfully');
        fetchUsers();
    };

    // ── Add member ────────────────────────────────────────────────────────────
    const handleAddMember = async () => {
        setAdding(true);
        setAddError('');

        // Sign up via Supabase Auth (this also triggers handle_new_user)
        const { data, error } = await supabase.auth.signUp({
            email: addForm.email,
            password: addForm.password,
            options: { data: { username: addForm.username } }
        });

        if (error) {
            setAddError(error.message);
            setAdding(false);
            return;
        }

        // Update username in profiles if signup went through
        if (data.user) {
            await supabase.from('profiles').update({ username: addForm.username }).eq('id', data.user.id);
        }

        setAdding(false);
        setShowAddModal(false);
        setAddForm({ email: '', password: '', username: '' });
        showSuccess('New member added successfully');
        fetchUsers();
    };

    // ── Delete user ───────────────────────────────────────────────────────────
    const handleDelete = async (uid) => {
        const { error } = await supabase.rpc('admin_delete_user', { p_target_user_id: uid });
        if (error) { alert(error.message); return; }
        setDeleteConfirm(null);
        showSuccess('User deleted');
        fetchUsers();
    };

    // Still resolving auth state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
        );
    }

    // Not logged in, or logged in but not admin → show admin login form
    if (!user || !user.is_admin) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <span className="material-symbols-outlined text-5xl text-primary mb-3 block">admin_panel_settings</span>
                        <h1 className="text-2xl font-extrabold tracking-tight">Admin Access</h1>
                        <p className="text-sm text-slate-400 mt-1">NoZero Control Center</p>
                    </div>

                    <form onSubmit={handleAdminLogin} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-white/5 space-y-4">
                        {user && !user.is_admin && (
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 text-red-600 text-xs font-bold px-4 py-2.5 rounded-xl">
                                ⚠️ You are signed in as <strong>{user.email}</strong> but do not have admin access. Sign in with the admin account below.
                            </div>
                        )}
                        {adminLoginError && (
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 text-red-600 text-xs font-bold px-4 py-2.5 rounded-xl">{adminLoginError}</div>
                        )}

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Admin Email</label>
                            <input
                                type="email"
                                value={adminLoginEmail}
                                onChange={e => setAdminLoginEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-sm font-medium outline-none focus:border-primary transition"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showAdminPass ? 'text' : 'password'}
                                    value={adminLoginPass}
                                    onChange={e => setAdminLoginPass(e.target.value)}
                                    required
                                    placeholder="Enter admin password"
                                    className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-sm font-medium outline-none focus:border-primary transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAdminPass(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                    tabIndex={-1}
                                >
                                    <span className="material-symbols-outlined text-lg">{showAdminPass ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={adminLoginLoading}
                            className="w-full py-3.5 rounded-xl bg-primary text-charcoal font-black text-sm disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                        >
                            {adminLoginLoading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                            {adminLoginLoading ? 'Signing in…' : 'Sign In as Admin'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black p-4 pb-12 max-w-2xl mx-auto">

            {/* ── HEADER ── */}
            <header className="flex items-center justify-between mb-6 mt-2">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
                        <h1 className="text-2xl font-extrabold tracking-tight">Admin Panel</h1>
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">NoZero Control Center</p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm"
                >
                    <span className="material-symbols-outlined text-base">close</span>
                </button>
            </header>

            {/* ── SUCCESS TOAST ── */}
            {successMsg && (
                <div className="mb-4 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-4 py-3 rounded-2xl text-center flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {successMsg}
                </div>
            )}

            {/* ── TABS ── */}
            <div className="bg-white dark:bg-zinc-900 p-1 rounded-2xl flex gap-1 mb-6 border border-slate-100 dark:border-white/5 shadow-sm">
                {[
                    { key: 'users', label: 'Users', icon: 'group' },
                    { key: 'stats', label: 'Overview', icon: 'bar_chart' },
                    { key: 'feedback', label: 'Feedback', icon: 'rate_review' },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === t.key ? 'bg-charcoal dark:bg-primary text-white dark:text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <span className="material-symbols-outlined text-sm">{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── FEEDBACK TAB ── */}
            {tab === 'feedback' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                            {feedbackList.length} submission{feedbackList.length !== 1 ? 's' : ''}
                        </p>
                        <button
                            onClick={() => { setFeedbackLoaded(false); fetchFeedback(); }}
                            className="text-[10px] font-bold text-primary flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">refresh</span>
                            Refresh
                        </button>
                    </div>

                    {loadingFeedback && (
                        <div className="flex items-center justify-center py-12">
                            <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
                        </div>
                    )}

                    {!loadingFeedback && feedbackList.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <span className="material-symbols-outlined text-4xl block mb-2">inbox</span>
                            <p className="text-sm font-bold">No feedback yet</p>
                        </div>
                    )}

                    {!loadingFeedback && feedbackList.map(fb => (
                        <div key={fb.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-100 dark:border-white/5 shadow-sm">
                            {/* Top row */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Category badge */}
                                        {fb.category && (
                                            <span className="text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                {fb.category}
                                            </span>
                                        )}
                                        {/* Star rating */}
                                        {fb.rating && (
                                            <span className="text-xs text-yellow-400 font-bold">
                                                {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 truncate">
                                        {fb.email || 'Anonymous'} · {new Date(fb.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            {/* Message */}
                            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                {fb.message}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* ── OVERVIEW TAB ── */}
            {tab === 'stats' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard label="Total Users" value={totalUsers} icon="group" />
                        <StatCard label="New (7 days)" value={recentNew} icon="person_add" color="text-sky-500" />
                        <StatCard label="Active Today" value={activeToday} icon="local_fire_department" color="text-orange-400" />
                        <StatCard label="Penalized Today" value={penalizedToday} icon="warning" color="text-red-500" />
                    </div>

                    {/* Recent signups */}
                    <section className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Recent Signups</h2>
                        <div className="space-y-3">
                            {nonAdminUsers.slice(0, 5).map(u => (
                                <div key={u.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                                            {(u.username || u.email || '?')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{u.username ?? '—'}</p>
                                            <p className="text-[10px] text-slate-400">{u.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-400">{new Date(u.created_at).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {/* ── USERS TAB ── */}
            {tab === 'users' && (
                <div className="space-y-4">
                    {/* Toolbar */}
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                            <input
                                type="text"
                                placeholder="Search by username or email…"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(0); }}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-sm font-medium outline-none focus:border-primary transition"
                            />
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-1.5 bg-primary text-charcoal font-black text-xs px-4 rounded-xl shadow-sm hover:bg-primary/90 transition whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-sm">person_add</span>
                            Add Member
                        </button>
                    </div>

                    {/* User list */}
                    {loadingUsers ? (
                        <div className="flex items-center justify-center py-12 text-slate-400">
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">No users found.</div>
                    ) : (
                        <div className="space-y-2">
                            {users.map(u => (
                                <div key={u.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-100 dark:border-white/5 shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {u.avatar_url ? (
                                                <img src={u.avatar_url} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                                                    {(u.username || u.email || '?')[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-sm font-bold">{u.username ?? '—'}</p>
                                                    {u.is_admin && (
                                                        <span className="text-[9px] bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-black uppercase">Admin</span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-400">{u.email}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">Joined {new Date(u.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => openEdit(u)}
                                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            {!u.is_admin && (
                                                <button
                                                    onClick={() => setDeleteConfirm(u)}
                                                    className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/10 text-red-400 flex items-center justify-center hover:bg-red-100 transition"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats row */}
                                    <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                                        {[
                                            { label: 'Rank', value: u.rank_label ?? 'E' },
                                            { label: 'Tier', value: u.tier_status ?? 'Unranked' },
                                            { label: 'Streak', value: `${u.current_streak ?? 0}d` },
                                            { label: '30d Score', value: u.active_30_day_score ?? 0 },
                                        ].map(s => (
                                            <div key={s.label} className="text-center">
                                                <p className="text-[9px] font-bold uppercase text-slate-400">{s.label}</p>
                                                <p className="text-xs font-extrabold text-slate-700 dark:text-white mt-0.5">{s.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="text-xs font-bold text-slate-400 disabled:opacity-30 flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">chevron_left</span> Prev
                        </button>
                        <span className="text-xs text-slate-400">Page {page + 1}</span>
                        <button
                            disabled={users.length < PAGE_SIZE}
                            onClick={() => setPage(p => p + 1)}
                            className="text-xs font-bold text-slate-400 disabled:opacity-30 flex items-center gap-1"
                        >
                            Next <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ── EDIT USER MODAL ── */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-extrabold">Edit User</h2>
                            <button onClick={() => setEditingUser(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {[
                                { key: 'username', label: 'Username', type: 'text' },
                                { key: 'current_streak', label: 'Current Streak (days)', type: 'number' },
                                { key: 'consistency_score', label: 'Consistency Score', type: 'number' },
                                { key: 'active_30_day_score', label: 'Active 30d Score', type: 'number' },
                                { key: 'lifetime_tier1_count', label: 'Lifetime Tier 1 Count', type: 'number' },
                                { key: 'missed_tasks_count', label: 'Missed Tasks Count', type: 'number' },
                                { key: 'total_points', label: 'Total Points', type: 'number' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{field.label}</label>
                                    <input
                                        type={field.type}
                                        value={editForm[field.key]}
                                        onChange={e => setEditForm(f => ({ ...f, [field.key]: e.target.value }))}
                                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-sm font-medium outline-none focus:border-primary transition"
                                    />
                                </div>
                            ))}

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tier Status</label>
                                <select
                                    value={editForm.tier_status}
                                    onChange={e => setEditForm(f => ({ ...f, tier_status: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-sm font-medium outline-none focus:border-primary transition"
                                >
                                    {TIER_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Prestige Rank</label>
                                <select
                                    value={editForm.rank_label}
                                    onChange={e => setEditForm(f => ({ ...f, rank_label: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-sm font-medium outline-none focus:border-primary transition"
                                >
                                    {RANK_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEdit}
                                disabled={saving}
                                className="flex-1 py-3 rounded-xl bg-primary text-charcoal font-black text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {saving ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : null}
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── ADD MEMBER MODAL ── */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-extrabold">Add New Member</h2>
                            <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        {addError && (
                            <div className="mb-4 bg-red-50 dark:bg-red-900/10 border border-red-200 text-red-600 text-xs font-bold px-4 py-2 rounded-xl">{addError}</div>
                        )}

                        <div className="space-y-3">
                            {[
                                { key: 'username', label: 'Username', type: 'text', placeholder: 'e.g. john_doe' },
                                { key: 'email', label: 'Email', type: 'email', placeholder: 'e.g. john@email.com' },
                                { key: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{f.label}</label>
                                    {f.key === 'password' ? (
                                        <div className="relative">
                                            <input
                                                type={showAddPass ? 'text' : 'password'}
                                                placeholder={f.placeholder}
                                                value={addForm[f.key]}
                                                onChange={e => setAddForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                                className="w-full px-3 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-sm font-medium outline-none focus:border-primary transition"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowAddPass(v => !v)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                                tabIndex={-1}
                                            >
                                                <span className="material-symbols-outlined text-lg">{showAddPass ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <input
                                            type={f.type}
                                            placeholder={f.placeholder}
                                            value={addForm[f.key]}
                                            onChange={e => setAddForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-sm font-medium outline-none focus:border-primary transition"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddMember}
                                disabled={adding || !addForm.email || !addForm.password || !addForm.username}
                                className="flex-1 py-3 rounded-xl bg-primary text-charcoal font-black text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {adding ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : null}
                                {adding ? 'Adding…' : 'Add Member'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── DELETE CONFIRM MODAL ── */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
                        <span className="material-symbols-outlined text-5xl text-red-500 mb-4">delete_forever</span>
                        <h2 className="text-lg font-extrabold mb-1">Delete User?</h2>
                        <p className="text-sm text-slate-400 mb-6">
                            This will permanently delete <strong className="text-slate-700 dark:text-white">{deleteConfirm.username ?? deleteConfirm.email}</strong> and all their data. This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 font-bold text-sm">Cancel</button>
                            <button
                                onClick={() => handleDelete(deleteConfirm.id)}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
