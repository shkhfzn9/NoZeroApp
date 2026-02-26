import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
    {
        label: 'Getting Started',
        icon: 'rocket_launch',
        faqs: [
            {
                q: 'What is NoZero?',
                a: `NoZero is a daily performance and accountability system built for people who refuse to let days slip by unnoticed. It's not a to-do list — it's an operating system for your life.\n\nThe core idea is simple: define your most important tasks each day, execute them, and build an unbreakable chain of consistent days. Every day you complete your tasks is a "non-zero day." A day where you did something meaningful. The goal is zero zero-days.\n\nNoZero tracks your performance, scores your consistency, assigns you a rank based on long-term achievement, and puts you on a leaderboard with others — making accountability social, competitive, and deeply motivating.`,
            },
            {
                q: 'Who is NoZero for?',
                a: `NoZero is built for anyone who wants to change their life through consistent daily action:\n\n• Students who want to study every single day\n• Entrepreneurs who need to ship work consistently\n• Athletes tracking training habits\n• Developers building projects daily\n• Anyone trying to break old patterns and build new ones\n\nIf you've ever said "I'll start tomorrow" and meant it — this app is for you. NoZero makes starting easy and stopping feel costly.`,
            },
            {
                q: 'How do I create an account?',
                a: `Go to the Signup page and choose a unique username (checked in real-time for availability), enter your email and a password of at least 6 characters.\n\nYour username is your identity on the leaderboard and your public profile URL (nozero.app/u/yourname). Choose it wisely — it represents your operator identity.\n\nOnce created, your account starts at:\n• Consistency Score: 0\n• Streak: 0 days\n• Tier: Unranked\n• Rank: E`,
            },
            {
                q: 'What should I do first after signing up?',
                a: `1. Add your first task — Go to the Dashboard and tap the "+" button. Define a meaningful task with a deadline.\n2. Upload a profile photo — Make your profile feel personal.\n3. Add friends — Find people you know and add them. Accountability is stronger in groups.\n4. Complete your task before the deadline — This earns your first points.\n5. Come back every day — The streak starts building immediately.`,
            },
        ],
    },
    {
        label: 'Tasks & Scoring',
        icon: 'task_alt',
        faqs: [
            {
                q: 'How do tasks work?',
                a: `Each task you create has:\n• A name/description\n• A point value (set by you)\n• A deadline\n• A status: pending → completed or missed\n\nWhen you mark a task as completed before its deadline, you earn the points. Late completions are still recorded but may affect your audit standing.\n\nYour daily point total is the sum of all tasks you complete on a given day. This drives your Consistency Score.`,
            },
            {
                q: 'How is the Consistency Score calculated?',
                a: `Your Consistency Score updates every day based on your performance:\n\n📈 GOOD DAY (daily points > 5):\nThe full daily points are added to your Consistency Score. If you also have a streak ≥ 30 days, your daily cap increases from 10 to 12 points.\n\n📉 BAD DAY (daily points ≤ 5):\n10 points are deducted from your Consistency Score. Yes, it can go negative. There's no safe floor — this is intentional.\n\n🔥 WEEKLY STREAK BONUS:\nEvery 7-day streak milestone adds +10 points to your score.\n\n📅 MISSED DAY PENALTY:\nIf you don't open the app for a day (or complete zero tasks), that day triggers a -10 penalty the next time you open the app. Penalties are backfilled for up to the last 30 days automatically.`,
            },
            {
                q: 'What is the daily point cap?',
                a: `To prevent gaming and reward quality over quantity:\n\n• Default cap: 10 points per day\n• Elevated cap: 12 points per day (unlocked when your current streak ≥ 30 days)\n\nPoints beyond the cap don't count toward your score — this encourages focused, high-quality work rather than piling on dozens of tiny tasks.`,
            },
            {
                q: 'Can my Consistency Score go negative?',
                a: `Yes. Absolutely. This is by design.\n\nMost apps protect you from failure. NoZero doesn't. A negative score is a signal — it means you've been inconsistent for long enough that you're in debt. Getting back to zero requires real effort.\n\nThis creates genuine stakes. The discomfort of watching your score drop is one of the most powerful motivators in the system.`,
            },
            {
                q: 'What is the Active 30-Day Score?',
                a: `Your Active 30-Day Score is different from your Consistency Score. It represents how much you've scored in the last 30 days only.\n\nIt refreshes daily and is used to determine your current Tier. Think of it as your recent form — like a football manager looking at last month's results, not your entire career.\n\nThis matters because:\n• It's more responsive to recent behavior\n• It means you can climb tiers quickly if you fix your habits\n• It also means you can fall from a high tier if you go cold`,
            },
        ],
    },
    {
        label: 'Streaks',
        icon: 'local_fire_department',
        faqs: [
            {
                q: 'How do streaks work?',
                a: `A streak is your count of consecutive days where you completed at least one meaningful task (daily points > 0).\n\nYour streak grows by 1 each qualifying day. Missing a single day resets your streak to 0.\n\nStreaks matter because:\n• Every 7 days: +10 consistency score bonus\n• 30+ days: daily point cap increases from 10 → 12\n• Streaks are visible on your public profile and leaderboard — pure social proof`,
            },
            {
                q: 'What breaks a streak?',
                a: `A streak breaks when you have a day where:\n• You completed zero tasks, OR\n• You earned 0 points (tasks existed but none were completed)\n\nThe app detects missed days automatically using your app-open timestamps. When you return after a gap, penalties and streak resets are applied for each missed day (up to 30 days backfilled).`,
            },
            {
                q: 'Is there any grace period for streaks?',
                a: `No. NoZero does not have a grace period, streak freeze, or recovery mechanic.\n\nThis is intentional. The streak is meaningful precisely because it's fragile. Every day you protect it is a real achievement. A 100-day streak with no grace period means 100 real days of unbroken action.`,
            },
            {
                q: 'What is the longest possible streak?',
                a: `Theoretically unlimited. The longer your streak, the more valuable it becomes:\n\n• Day 7: +10 bonus\n• Day 14: +10 bonus\n• Day 21: +10 bonus\n• Day 30: Cap unlocks (10 → 12 pt/day)\n• Day 365+: The leaderboard knows. Your peers see. It becomes rare status.`,
            },
        ],
    },
    {
        label: 'Tiers & Ranks',
        icon: 'military_tech',
        faqs: [
            {
                q: 'What is the Tier system?',
                a: `Tiers (1–10, plus Unranked) reflect your Active 30-Day Score — your recent performance window.\n\nHigher tier = better recent form:\n• Tier 1: Elite tier (top performers)\n• Tiers 2–5: High performance\n• Tiers 6–9: Building consistency\n• Tier 10: Just starting out\n• Unranked: Score too low or new account\n\nTiers are recalculated daily. You can climb quickly with consistent action. You can also drop if you go cold. Tiers reward current form, not past glory.`,
            },
            {
                q: 'What are Prestige Ranks?',
                a: `Ranks (E, D, C, B, A, S, SS, SS+, SSS, SSS+) are permanent achievement markers based on your Lifetime Tier 1 Count — how many elite 30-day cycles you've earned over your entire history.\n\nUnlike tiers, RANKS NEVER GO DOWN. Once you hit Rank A, you stay at Rank A or higher forever. This creates a permanent record of your best eras.\n\nRank labels on the leaderboard and profile represent your legacy, not your current state. A person with SSS+ rank but Tier 5 this month is still an elite — they just had a rough patch.`,
            },
            {
                q: 'How do I earn Lifetime Tier 1 counts?',
                a: `At the end of each 30-day cycle, the system evaluates your tier performance:\n\n🥇 If you were in Tier 1 at cycle end:\n→ +1 directly to Lifetime Tier 1 Count\n\n🥈 If you were in Tier 2:\n→ Your Tier 2 cycle count accumulates. After 2 Tier 2 cycles = +1 Lifetime Tier 1 Count\n\n🥉 If you were in Tier 3:\n→ Your Tier 3 cycle count accumulates. After 3 Tier 3 cycles = +1 Lifetime Tier 1 Count\n\nLower tiers don't contribute to lifetime counts. You have to be performing at the top.`,
            },
            {
                q: 'How do Ranks map to Lifetime Tier 1 Count?',
                a: `Rank E:   0 Tier 1 cycles\nRank D:   1 Tier 1 cycle\nRank C:   2 cycles\nRank B:   4 cycles\nRank A:   7 cycles\nRank S:   11 cycles\nRank SS:  16 cycles\nRank SS+: 22 cycles\nRank SSS: 29 cycles\nRank SSS+: 37+ cycles\n\nEach rank requires more effort than the last. SSS+ is genuinely rare — you have to be elite for years.`,
            },
            {
                q: 'How does the leaderboard sort people?',
                a: `The leaderboard uses a 4-level sort:\n\n1. Rank label (SSS+ first, E last)\n2. Tier (Tier 1 first, Unranked last)\n3. Active 30-Day Score (higher first)\n4. Current Streak (higher first)\n\nThis means someone with a higher lifetime rank stays above you on the board even if they have a lower score this month. Legacy matters.`,
            },
        ],
    },
    {
        label: 'Friends & Social',
        icon: 'group',
        faqs: [
            {
                q: 'How do I add friends?',
                a: `Go to the Friends tab (bottom navigation). Search by username and send a friend request. Once they accept, you can both see each other's progress on the Friends Progress page.\n\nFriendships make accountability real. You can now track:\n• Their recent task completions\n• Their streak and score\n• Their profile card`,
            },
            {
                q: 'What can friends see about me?',
                a: `Friends can see:\n• Your username and avatar\n• Your current streak\n• Your rank and tier\n• Your recent task activity (task names and completion status)\n• Your active score\n\nPrivate details (email, exact consistency score breakdown) are not visible to friends.`,
            },
            {
                q: 'What is a Public Profile?',
                a: `Every user gets a shareable profile link: nozero.app/u/username\n\nThis public page shows:\n• Your avatar, username, rank, tier\n• Consistency graph (21-day activity view)\n• Key stats: streak, score, audit score\n• It can be shared anywhere — social media, CVs, messaging apps\n\nYour public profile is your proof of work. It's permanent and verifiable.`,
            },
            {
                q: 'What is the Public Audit?',
                a: `The Public Audit is a feature where your entire task history is viewable by anyone with the link. Task names, completion status, timestamps — all on record.\n\nThis radical transparency is the ultimate accountability tool. When you know your performance is on the public record, you try harder. The audit cannot be deleted or edited.\n\nYour "audit score" reflects how clean your record is.`,
            },
        ],
    },
    {
        label: 'Account & Privacy',
        icon: 'shield_person',
        faqs: [
            {
                q: 'Can I change my username?',
                a: `Currently, usernames cannot be changed after account creation. Your username is your permanent operator identity on NoZero. Choose it carefully at signup — it\'s part of your public profile URL.`,
            },
            {
                q: 'How do I delete my account?',
                a: `Account deletion requests can be submitted via the Contact Us page. We process deletion requests within 48 hours. All your data including tasks, scores, and profile will be permanently removed.`,
            },
            {
                q: 'Is my data private?',
                a: `Your private data (email, password, task details you haven't shared) is secured with Row Level Security (RLS) — only you can access it. Public profile data (username, streak, rank) is visible to others only when you share your profile link.\n\nWe never sell your data. See our full Privacy Policy for details.`,
            },
            {
                q: 'What if I forget my password?',
                a: `Use the "Forgot Password" option on the login screen. Supabase Auth will send a password reset email to your registered address. Check your spam folder if it doesn't arrive within 2 minutes.`,
            },
        ],
    },
];

export default function FAQPage() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState(0);
    const [openIdx, setOpenIdx] = useState(null);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black pb-24">
            {/* Header */}
            <header className="px-6 pt-6 pb-4 flex items-center gap-4 sticky top-0 bg-slate-50 dark:bg-black z-10 border-b border-slate-100 dark:border-white/5">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/5 shrink-0">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-extrabold">FAQ</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Everything you need to know</p>
                </div>
            </header>

            {/* Category tabs */}
            <div className="flex gap-2 px-6 pt-4 pb-3 overflow-x-auto scrollbar-none">
                {CATEGORIES.map((cat, i) => (
                    <button
                        key={cat.label}
                        onClick={() => { setActiveCategory(i); setOpenIdx(null); }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeCategory === i
                                ? 'bg-primary text-charcoal border-primary shadow-sm'
                                : 'bg-white dark:bg-zinc-900 text-slate-500 border-slate-200 dark:border-white/10 hover:border-primary/40'
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Questions */}
            <div className="px-6 space-y-3">
                {CATEGORIES[activeCategory].faqs.map((faq, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                        <button
                            onClick={() => setOpenIdx(openIdx === i ? null : i)}
                            className="w-full flex items-start justify-between px-5 py-4 text-left gap-3"
                        >
                            <span className="text-sm font-bold leading-snug flex-1">{faq.q}</span>
                            <span className={`material-symbols-outlined text-slate-400 text-base transition-transform shrink-0 mt-0.5 ${openIdx === i ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                        {openIdx === i && (
                            <div className="px-5 pb-5 border-t border-slate-100 dark:border-white/5 pt-4">
                                {faq.a.split('\n').map((line, li) => (
                                    line.trim() === ''
                                        ? <div key={li} className="h-2" />
                                        : <p key={li} className={`text-sm leading-relaxed ${line.startsWith('•') || line.startsWith('→') || /^\d+\./.test(line)
                                                ? 'text-slate-600 dark:text-slate-300 pl-2'
                                                : line.match(/^[📈📉🔥📅🥇🥈🥉]/)
                                                    ? 'font-bold text-charcoal dark:text-white mt-1'
                                                    : 'text-slate-500 dark:text-slate-400'
                                            }`}>{line}</p>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
