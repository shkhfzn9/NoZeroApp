import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Content ──────────────────────────────────────────────────────────────── */
const PROBLEM = {
    headline: 'The Real Problem with Productivity',
    body: [
        `Most people don't fail because they lack talent, intelligence, or opportunity. They fail because they can't maintain consistent daily action over long periods of time.`,
        `Standard to-do apps let you add tasks, check them off, and feel good — until you look back a month later and realize you've been "busy" but made zero real progress. There's no accountability, no record, no cost to missing a day.`,
        `Social media gives you fake productivity — you watch people succeed instead of doing the work yourself. You feel informed but you're not building anything.`,
        `NoZero exists to fix this. It creates a system where every day is counted, every action is recorded, and missing a day has a real cost. The result: you start taking your daily choices seriously.`,
    ],
};

const HOW_IT_WORKS_SECTIONS = [
    {
        number: '01',
        title: 'Define Your Daily Tasks',
        icon: 'assignment',
        color: 'bg-blue-500',
        summary: 'Your tasks are your daily operating protocol. They define what a "good day" looks like for YOU.',
        detail: [
            'Each day, you add tasks to NoZero with a name, point value, and deadline. These should be the actions that actually move your life forward — not busywork.',
            'Think: learning a skill for 1 hour, writing 500 words, completing a workout, reading 30 pages, coding a feature. High-signal actions with a clear done/not-done outcome.',
            'Each task earns you points (you assign the value). The more important the task, the higher the points. Your task list becomes your personal performance contract.',
            'Rule of thumb: if you complete your tasks most days, you\'re doing well. If you\'re consistently failing to complete them, either the tasks are wrong or the habits aren\'t built yet. NoZero shows you exactly which it is.',
        ],
    },
    {
        number: '02',
        title: 'Complete Tasks & Earn Points',
        icon: 'check_circle',
        color: 'bg-emerald-500',
        summary: 'Completing tasks earns daily points. These points drive your Consistency Score and determine your Tier.',
        detail: [
            'Daily points are capped at 10 (or 12 if you have a 30-day+ streak). This prevents gaming — you can\'t pile on 50 small tasks and earn 50 points. Quality over quantity is enforced by the system.',
            'MORE than 5 points in a day = your score goes UP by those points. You\'re in the green — a good operator.',
            '5 or FEWER points in a day = your score drops by exactly 10 points. Even if you complete a minor task, failing to pass the >5 point threshold means you get penalized. (Max one -10 penalty per day).',
            'The scoring system is harsh by design. It reflects reality. In real life, doing half your work isn\'t half good — it\'s often completely useless. NoZero mirrors that.',
        ],
    },
    {
        number: '03',
        title: 'Build and Protect Your Streak',
        icon: 'local_fire_department',
        color: 'bg-orange-500',
        summary: 'Your streak is the most visible measure of your daily commitment. It\'s also the most fragile.',
        detail: [
            'A streak increments only when you complete tasks earning more than zero points. Miss a day = streak reset to zero. No exceptions. No freeze tokens.',
            'Every 7 consecutive days triggers a +10 bonus to your Consistency Score. A 30-day streak unlocks a higher daily point cap (10 → 12). Longer streaks earn progressively more.',
            'The fragility is the point. A 90-day streak with no safety net is real. It means 90 consecutive days of actual execution. This is the proof that changes how you see yourself.',
            'Psychologically, the streak becomes a loss-aversion mechanism. Once you hit day 20, you feel the weight of almost breaking it. That feeling makes you show up on hard days. That\'s when the real growth happens.',
        ],
    },
    {
        number: '04',
        title: 'The Day Off Protocol',
        icon: 'bedtime',
        color: 'bg-indigo-500',
        summary: 'You are allowed up to 2 days off per week to rest and recharge without breaking your streak.',
        detail: [
            'NoZero is about consistency, but burnout is real. The system permits up to 2 recorded days off per rolling week (Mon-Sun).',
            'Taking a Day Off protects your streak from breaking and prevents the -10 point penalty for that day. It allows you to legitimately rest without the psychological weight of losing your progress.',
            'Unused days off DO NOT carry over to the next week. You either use them or lose them. We recommend taking them on weekends, but you can use them anytime.',
            'Tasks completed on a declared Day Off do not earn points and do not count toward your consistency score. True rest means stepping away from the board completely.',
        ],
    },
    {
        number: '05',
        title: 'Your Active 30-Day Score & Tier',
        icon: 'monitoring',
        color: 'bg-violet-500',
        summary: 'Your tier reflects the last 30 days — your current form, not your history.',
        detail: [
            'The Active 30-Day Score is calculated from your daily_score_log — the sum of all score changes in the last 30 days. It\'s refreshed every time you open the app.',
            'This score maps to one of 10 Tiers (plus Unranked). Tier 1 is elite. Tier 10 is just starting. Tiers can go up or down daily based on recent performance.',
            'Why 30 days? Because a month is long enough to show real patterns but short enough to be actionable. A good 30 days can move you from Tier 7 to Tier 2. A bad 30 days can drop you from Tier 3 to Tier 8.',
            'Tiers are your motivation to stay sharp. No coasting. Past performance in a previous month doesn\'t protect your tier today. Every 30-day window is a fresh battle.',
        ],
    },
    {
        number: '06',
        title: 'Prestige Ranks — Your Legacy',
        icon: 'military_tech',
        color: 'bg-yellow-500',
        summary: 'Ranks (E → SSS+) are permanent. They only go up. They represent who you are at your best.',
        detail: [
            'Unlike Tiers, Ranks are earned over lifetime performance and never decrease. They\'re calculated from your "Lifetime Tier 1 Count" — how many elite 30-day cycles you\'ve accumulated.',
            'Reaching Tier 1 in a 30-day cycle gives you +1 toward your Lifetime Count. Two Tier 2 cycles = another +1. Three Tier 3 cycles = another +1. Anything lower doesn\'t contribute.',
            'Rank progression: E (0) → D (1) → C (2) → B (4) → A (7) → S (11) → SS (16) → SS+ (22) → SSS (29) → SSS+ (37+). Each rank requires more elite cycles than the last.',
            'SSS+ rank means you\'ve been genuinely elite for multiple years of consistent effort. It\'s not grindable with tricks. It\'s earned through sustained excellence.',
            'Your rank lives on the leaderboard and your public profile permanently. Even if you have a bad month and drop in tier, your rank shows what you\'re capable of at your peak.',
        ],
    },
    {
        number: '07',
        title: 'The Leaderboard & Social Pressure',
        icon: 'leaderboard',
        color: 'bg-rose-500',
        summary: 'Competing against real people with real records creates pressure that no solo app can replicate.',
        detail: [
            'The leaderboard sorts by: Rank → Tier → Active 30-Day Score → Streak. This means legacy and recent form both matter.',
            'Seeing your name below someone you know is one of the most effective motivators in existence. The competitive layer turns individual habit-building into a team sport.',
            'Friends lists let you track your inner circle specifically. You don\'t just compete globally — you can watch your friends\' daily execution and know they\'re watching yours.',
            'Public profiles and shareable links mean your performance is visible beyond the app. You can share your consistency graph on social media, include it in Professional profiles, or use it to hold yourself accountable to your audience.',
        ],
    },
    {
        number: '08',
        title: 'The Audit System',
        icon: 'fact_check',
        color: 'bg-cyan-500',
        summary: 'Your full task history is publicly verifiable. No hiding. No editing. Radical transparency.',
        detail: [
            'Every task you create, complete, or miss is logged permanently. The Public Audit page displays this history for anyone with your link.',
            'The audit score reflects your completion rate over your entire history. It can\'t be gamed because it\'s timestamp-verified.',
            'Why does this matter? When you know your record is public and permanent, you make better daily decisions. The audit creates external accountability even when no one is directly watching you.',
            'This feature is unique to NoZero. No other productivity app gives you a permanent, public, verifiable track record. It\'s your performance CV.',
        ],
    },
];

const COMPETITIVE_ADVANTAGES = [
    {
        icon: 'psychology',
        title: 'Loss Aversion Works For You',
        body: 'Human brains feel losses more than gains. NoZero turns this into your superpower. The streak you\'re about to break, the score dropping, the rank slipping — these create visceral motivation to show up.',
    },
    {
        icon: 'visibility',
        title: 'Everything Is Visible',
        body: 'When your performance is public record (audit, leaderboard, shareable profile), you try harder. Accountability to an audience — even a small one — is more powerful than accountability to yourself alone.',
    },
    {
        icon: 'trending_up',
        title: 'Dual Metrics: Recent + Lifetime',
        body: 'Tiers reward recent form. Ranks reward lifetime achievement. This means you\'re always playing two games simultaneously: perform well now (for the tier) and build legacy (for the rank).',
    },
    {
        icon: 'warning',
        title: 'Real Consequences',
        body: 'A negative consistency score, a broken streak, a dropped tier — these are real, visible consequences. Most apps have no downside for slacking. NoZero does. This changes behavior.',
    },
    {
        icon: 'people',
        title: 'Social Competition',
        body: 'Friends, leaderboards, and public profiles turn individual effort into social performance. You\'re not just competing with yourself — you\'re competing with people who know you.',
    },
    {
        icon: 'history',
        title: 'Permanent Record',
        body: 'Your rank, audit history, and consistency graph don\'t disappear. Years from now, your record will show exactly what you did in 2025, 2026, and beyond. Treat each day as a line in that record.',
    },
];

const OUTCOMES = [
    { icon: '🧠', title: 'Mental Clarity', body: 'Knowing exactly what you need to do each day removes decision fatigue. You stop wondering what to work on and start executing.' },
    { icon: '💪', title: 'Real Discipline', body: 'Discipline isn\'t motivation — it\'s a system. NoZero IS the system. After 30 days of daily logging, completion becomes automatic.' },
    { icon: '📈', title: 'Compound Progress', body: 'Small daily actions compound over months and years. 10 points a day for 365 days = transformational outcomes. NoZero makes the compound effect visible.' },
    { icon: '🏆', title: 'Verifiable Achievement', body: 'Your rank, your streak, your audit — these are real credentials. They can\'t be faked. They prove to yourself and others that you deliver.' },
    { icon: '🤝', title: 'Stronger Accountability', body: 'Friends who can see your progress create healthy competitive pressure. You show up harder when others are watching and depending on you.' },
    { icon: '🔥', title: 'Identity Shift', body: 'After 60 days of non-zero performance, you stop asking "should I do the work today?" You just do it. Your identity shifts from someone who tries to someone who executes.' },
];

export default function HowItWorksPage() {
    const navigate = useNavigate();
    const [expandedSection, setExpandedSection] = useState(null);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black pb-24">
            {/* Header */}
            <header className="px-6 pt-6 pb-4 flex items-center gap-4 sticky top-0 bg-slate-50 dark:bg-black z-10 border-b border-slate-100 dark:border-white/5">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/5 shrink-0">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-xl font-extrabold">How NoZero Works</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">The full system explained</p>
                </div>
            </header>

            <div className="px-6 space-y-8 pt-6">

                {/* Problem Statement */}
                <section className="bg-charcoal dark:bg-zinc-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl">
                    <div className="absolute -right-8 -top-8 w-40 h-40 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -left-4 -bottom-8 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-rose-400 text-xl">report_problem</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">The Problem</span>
                        </div>
                        <h2 className="text-xl font-extrabold mb-4 leading-tight">{PROBLEM.headline}</h2>
                        {PROBLEM.body.map((p, i) => (
                            <p key={i} className="text-sm text-slate-300 leading-relaxed mb-3 last:mb-0">{p}</p>
                        ))}
                    </div>
                </section>

                {/* Solution intro */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary">bolt</span>
                        <h2 className="text-base font-extrabold uppercase tracking-wider">The System — Step by Step</h2>
                    </div>

                    <div className="space-y-3">
                        {HOW_IT_WORKS_SECTIONS.map((section, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                                    className="w-full flex items-center gap-4 p-5 text-left"
                                >
                                    <div className={`w-10 h-10 ${section.color} rounded-2xl flex items-center justify-center shrink-0`}>
                                        <span className="material-symbols-outlined text-white text-lg">{section.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[10px] font-black text-slate-400">{section.number}</span>
                                        </div>
                                        <p className="font-extrabold text-sm leading-snug">{section.title}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{section.summary}</p>
                                    </div>
                                    <span className={`material-symbols-outlined text-slate-300 shrink-0 transition-transform ${expandedSection === i ? 'rotate-180' : ''}`}>expand_more</span>
                                </button>

                                {expandedSection === i && (
                                    <div className="px-5 pb-5 border-t border-slate-100 dark:border-white/5 pt-4 space-y-3">
                                        {section.detail.map((para, pi) => (
                                            <p key={pi} className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{para}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* What Keeps You Ahead */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary">rocket_launch</span>
                        <h2 className="text-base font-extrabold uppercase tracking-wider">What Keeps You Ahead</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {COMPETITIVE_ADVANTAGES.map((adv, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-100 dark:border-white/5 shadow-sm flex items-start gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-lg text-primary">{adv.icon}</span>
                                </div>
                                <div>
                                    <p className="font-extrabold text-sm mb-1">{adv.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{adv.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Outcomes */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary">emoji_events</span>
                        <h2 className="text-base font-extrabold uppercase tracking-wider">What You'll Gain</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {OUTCOMES.map((o, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-100 dark:border-white/5 shadow-sm">
                                <span className="text-2xl block mb-2">{o.icon}</span>
                                <p className="font-extrabold text-sm mb-1">{o.title}</p>
                                <p className="text-[11px] text-slate-400 leading-relaxed">{o.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section className="bg-primary rounded-3xl p-6 shadow-xl">
                    <h2 className="text-xl font-extrabold text-charcoal mb-2">The Only Question Left</h2>
                    <p className="text-sm text-charcoal/70 leading-relaxed mb-4">
                        You now understand the system. You understand the cost of zero-days and the reward of consistency. The only thing between you and results is the decision to start — and then the decision to keep going tomorrow.
                    </p>
                    <p className="text-sm font-black text-charcoal">
                        How many non-zero days can you build in a row? ⚡
                    </p>
                </section>
            </div>
        </div>
    );
}
