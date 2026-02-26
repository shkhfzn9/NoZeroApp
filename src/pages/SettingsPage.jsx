import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';

const SETTINGS_SECTIONS = [
    {
        title: 'App Info',
        items: [
            { label: 'How NoZero Works', icon: 'auto_stories', path: '/how-it-works' },
            { label: 'About NoZero', icon: 'info', path: '/about' },
            { label: 'FAQ', icon: 'help_outline', path: '/faq' },
            { label: 'Privacy Policy', icon: 'privacy_tip', path: '/privacy' },
            { label: 'Terms of Service', icon: 'gavel', path: '/terms' },
        ],
    },
    {
        title: 'Support',
        items: [
            { label: 'Send Feedback', icon: 'rate_review', path: '/feedback' },
            { label: 'Contact Us', icon: 'mail', path: '/contact' },
        ],
    },
    {
        title: 'Account',
        items: [
            { label: 'Edit Profile', icon: 'manage_accounts', path: '/profile' },
            { label: 'Shareable Profile', icon: 'share', path: null, action: 'share' },
        ],
    },
];

export default function SettingsPage() {
    const navigate = useNavigate();
    const { user, signOut } = useTasks();
    const [signingOut, setSigningOut] = useState(false);

    const handleShare = () => {
        if (user?.username) {
            navigator.clipboard.writeText(`${window.location.origin}/u/${user.username}`);
        }
    };

    const handleAction = (item) => {
        if (item.action === 'share') { handleShare(); return; }
        if (item.path) navigate(item.path);
    };

    const handleSignOut = async () => {
        setSigningOut(true);
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black pb-24">
            {/* Header */}
            <header className="px-6 pt-6 pb-4 flex items-center gap-4 bg-slate-50 dark:bg-black sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/5"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight">Settings</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preferences & Info</p>
                </div>
            </header>

            {/* User card */}
            {user && (
                <div className="mx-6 mb-6 bg-white dark:bg-zinc-900 rounded-3xl p-4 flex items-center gap-4 border border-slate-100 dark:border-white/5 shadow-sm">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                            {(user.username || user.email || '?')[0].toUpperCase()}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-extrabold truncate">{user.username || '—'}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">{user.rank_label ?? 'E'}</span>
                            <span className="text-[9px] font-bold text-slate-400">{user.tier_status ?? 'Unranked'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Sections */}
            <div className="px-6 space-y-6">
                {SETTINGS_SECTIONS.map(section => (
                    <div key={section.title}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{section.title}</p>
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm divide-y divide-slate-100 dark:divide-white/5">
                            {section.items.map(item => (
                                <button
                                    key={item.label}
                                    onClick={() => handleAction(item)}
                                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
                                >
                                    <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-lg text-slate-600 dark:text-slate-300">{item.icon}</span>
                                    </div>
                                    <span className="flex-1 text-sm font-semibold">{item.label}</span>
                                    <span className="material-symbols-outlined text-slate-300 dark:text-zinc-600 text-base">chevron_right</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Sign Out */}
                <div>
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
                        <button
                            onClick={handleSignOut}
                            disabled={signingOut}
                            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            <div className="w-9 h-9 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg text-red-500">logout</span>
                            </div>
                            <span className="flex-1 text-sm font-semibold text-red-500">
                                {signingOut ? 'Signing Out…' : 'Sign Out'}
                            </span>
                        </button>
                    </div>
                </div>

                <p className="text-center text-[10px] text-slate-300 dark:text-zinc-700 font-bold pb-4">NoZero v1.0 · Built for operators</p>
            </div>
        </div>
    );
}
