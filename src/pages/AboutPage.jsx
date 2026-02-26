import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black pb-24">
            <header className="px-6 pt-6 pb-4 flex items-center gap-4 sticky top-0 bg-slate-50 dark:bg-black z-10">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/5">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-xl font-extrabold">About NoZero</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Our Mission</p>
                </div>
            </header>

            <div className="px-6 space-y-5">
                {/* Hero card */}
                <div className="bg-charcoal dark:bg-zinc-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-4 -rotate-6">
                            <span className="material-symbols-outlined text-charcoal text-2xl rotate-6">bolt</span>
                        </div>
                        <h2 className="text-2xl font-extrabold leading-tight mb-2">Zero Days Wasted.<br />Every Day Counts.</h2>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            NoZero is built on the philosophy that consistency — not intensity — is the superpower.
                            One disciplined action every day compounds into extraordinary results over time.
                        </p>
                    </div>
                </div>

                {[
                    {
                        icon: 'track_changes',
                        title: 'What We Do',
                        body: 'NoZero gives you a structured system to define your most important daily tasks, complete them, and build an unbroken chain of consistent days. Every task has an audit trail — no excuses, no shortcuts.'
                    },
                    {
                        icon: 'emoji_events',
                        title: 'The Tier & Rank System',
                        body: 'We gamify consistency with a 10-Tier system (based on your last 30 days) and a Prestige Rank system (E to SSS+) that reflects your lifetime achievement. Tiers fluctuate daily. Ranks never go down.'
                    },
                    {
                        icon: 'groups',
                        title: 'Community & Accountability',
                        body: 'Add friends, track each other\'s progress, and compete on the leaderboard. The public audit system means your track record is transparent — the ultimate accountability tool.'
                    },
                    {
                        icon: 'favorite',
                        title: 'Our Values',
                        body: 'Radical honesty. Zero compromise. Long-term thinking. We believe every person is capable of extraordinary discipline — they just need the right system.'
                    },
                ].map(card => (
                    <div key={card.title} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg text-primary">{card.icon}</span>
                            </div>
                            <h3 className="font-extrabold">{card.title}</h3>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{card.body}</p>
                    </div>
                ))}

                <p className="text-center text-[11px] text-slate-400 pt-2 pb-4">
                    NoZero v1.0 · Crafted with purpose
                </p>
            </div>
        </div>
    );
}
