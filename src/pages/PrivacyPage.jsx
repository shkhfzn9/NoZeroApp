import React from 'react';
import { useNavigate } from 'react-router-dom';

const SECTIONS = [
    {
        title: '1. Information We Collect',
        body: 'We collect information you provide directly to us when you create an account, including your username and email address. We also collect task activity data (completion status, timestamps) to power your consistency score and audit trail. We do not collect payment information.'
    },
    {
        title: '2. How We Use Your Information',
        body: 'Your data is used solely to operate and improve the NoZero service: calculating your scores and tiers, displaying your public profile (if you share your link), and providing leaderboard functionality. We do not sell your personal data to third parties.'
    },
    {
        title: '3. Data Storage & Security',
        body: 'Your data is stored securely on Supabase (PostgreSQL) with Row Level Security (RLS) enforced. Only you can read or write your own private data. Public profile data (username, streak, rank) is visible to others only when you share your profile link.'
    },
    {
        title: '4. Third-Party Services',
        body: 'NoZero uses Supabase for authentication and database services. Supabase\'s own privacy policy governs their handling of your data. We do not use advertising networks or data brokers.'
    },
    {
        title: '5. Data Retention',
        body: 'Your data is retained for as long as your account is active. You may request deletion of your account and all associated data by contacting us directly.'
    },
    {
        title: '6. Changes to This Policy',
        body: 'We may update this policy from time to time. We will notify users of significant changes via in-app notification. Continued use of NoZero after changes constitutes acceptance of the updated policy.'
    },
    {
        title: '7. Contact',
        body: 'Questions about your privacy? Reach out to us through the Feedback page or via the Contact Us page. We take privacy seriously and will respond within 48 hours.'
    },
];

export default function PrivacyPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black pb-24">
            <header className="px-6 pt-6 pb-4 flex items-center gap-4 sticky top-0 bg-slate-50 dark:bg-black z-10">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/5">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-xl font-extrabold">Privacy Policy</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Last updated: Feb 2026</p>
                </div>
            </header>

            <div className="px-6 space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-2xl px-5 py-4">
                    <p className="text-sm font-bold text-primary">
                        Your privacy is important to us. NoZero is built with minimal data collection in mind — we only take what's needed to run the service.
                    </p>
                </div>

                {SECTIONS.map(s => (
                    <div key={s.title} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm">
                        <h3 className="font-extrabold text-sm mb-2">{s.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.body}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
