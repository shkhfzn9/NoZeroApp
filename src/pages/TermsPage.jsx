import React from 'react';
import { useNavigate } from 'react-router-dom';

const SECTIONS = [
    {
        title: '1. Acceptance of Terms',
        body: 'By accessing or using NoZero, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.'
    },
    {
        title: '2. Eligibility',
        body: 'You must be at least 13 years of age to use NoZero. By using this service, you confirm that you meet this requirement.'
    },
    {
        title: '3. Account Responsibilities',
        body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.'
    },
    {
        title: '4. Acceptable Use',
        body: 'You agree not to use NoZero to harass other users, post false information, or otherwise misuse the platform. We reserve the right to suspend or terminate accounts that violate these rules.'
    },
    {
        title: '5. User-Generated Content',
        body: 'Task names, usernames, and other content you create on NoZero remain your property. By using the service, you grant us a limited license to display this content within the app. We do not claim ownership of your content.'
    },
    {
        title: '6. Service Availability',
        body: 'We strive to maintain 99% uptime but do not guarantee uninterrupted availability. We reserve the right to modify, suspend, or discontinue the service at any time with reasonable notice.'
    },
    {
        title: '7. Limitation of Liability',
        body: 'NoZero is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.'
    },
    {
        title: '8. Changes to Terms',
        body: 'We may update these terms from time to time. Continued use of NoZero after changes constitutes acceptance. We will provide reasonable notice of material changes.'
    },
];

export default function TermsPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black pb-24">
            <header className="px-6 pt-6 pb-4 flex items-center gap-4 sticky top-0 bg-slate-50 dark:bg-black z-10">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/5">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-xl font-extrabold">Terms of Service</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Last updated: Feb 2026</p>
                </div>
            </header>

            <div className="px-6 space-y-4">
                <div className="bg-slate-100 dark:bg-zinc-800 rounded-2xl px-5 py-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                        Please read these terms carefully before using NoZero. Using the app means you agree to these terms.
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
