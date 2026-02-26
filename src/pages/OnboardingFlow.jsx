import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// ── Slide content ─────────────────────────────────────────────────────────────
const SLIDES = [
    {
        id: 'welcome',
        icon: 'verified_user',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
        tag: 'Welcome',
        title: 'You Made It\nHere.',
        tagline: 'But getting here was the easy part.',
        body: `NoZero is a daily discipline audit system. From today, every single day of your life gets a mark — done, or not done.\n\nThere is no neutral. No "I was busy." No "I'll catch up tomorrow." Just your record, building in public, one day at a time.`,
        hint: 'Swipe through — this matters.',
    },
    {
        id: 'tasks',
        icon: 'task_alt',
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-500',
        tag: 'Daily Audit',
        title: 'Your Tasks.\nYour Proof.',
        tagline: 'Commit to what you want to build — and prove it daily.',
        body: `You add tasks to your profile — things you commit to doing every day. Could be training, studying, building a project, writing, anything that matters to you.\n\nEach day you mark tasks complete before midnight. If you don't — that day is marked as missed. On record. Permanently.`,
        hint: null,
    },
    {
        id: 'streak',
        icon: 'local_fire_department',
        iconBg: 'bg-orange-500/10',
        iconColor: 'text-orange-500',
        tag: 'Streak & Score',
        title: 'Your Streak\nIs Your Signal.',
        tagline: 'One missed day resets it. Keep showing up.',
        body: `Your current streak counts how many consecutive days you have completed all your tasks. Your Consistency Score is a deeper number — it measures your overall ratio of successful days to total days.\n\nYour Prestige Rank and Tier reflect both. The higher you go, the harder it becomes to stay there.`,
        hint: null,
    },
    {
        id: 'profile',
        icon: 'person',
        iconBg: 'bg-violet-500/10',
        iconColor: 'text-violet-500',
        tag: 'Public Profile',
        title: 'Everything\nYou Do Is Recorded.',
        tagline: 'This is your verifiable proof of who you actually are.',
        body: `Your profile is public. Anyone — employer, collaborator, friend, stranger — can visit your link and see your consistency history: your streak, your annual heatmap, your tier, your rank.\n\nNo filters. No editing. Just your record. This is what makes NoZero valuable. If you show up, it shows. If you don't, that shows too.`,
        hint: null,
    },
    {
        id: 'friends',
        icon: 'group',
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
        tag: 'Friends',
        title: 'Surround Yourself\nWith People Who Show Up.',
        tagline: 'Friends on NoZero hold the same standard you do.',
        body: `You can add other users as friends and track each other's progress. Not as cheerleaders — as accountability. You will see their streaks, their consistency, their rank.\n\nThe people you connect with here are the ones who decided to be serious about their lives. Choose carefully.`,
        hint: null,
    },
    {
        id: 'leaderboard',
        icon: 'emoji_events',
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-500',
        tag: 'Leaderboard',
        title: 'Where Do\nYou Actually Stand?',
        tagline: 'The global leaderboard doesn\'t lie.',
        body: `The leaderboard ranks every user by consistency score and streak — updated daily. There is also a Loserboard for the users who have missed the most days.\n\nWhether you rise or fall is entirely up to you. And the whole community can see it.`,
        hint: null,
    },
];

// ── Slide component ───────────────────────────────────────────────────────────
function Slide({ slide, current, total, onNext, onPrev }) {
    return (
        <div className="flex flex-col h-full">
            {/* Progress bar */}
            <div className="flex gap-1.5 mb-8">
                {Array.from({ length: total }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 rounded-full flex-1 transition-colors duration-300 ${i <= current ? 'bg-primary' : 'bg-black/10 dark:bg-white/10'
                            }`}
                    />
                ))}
            </div>

            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl ${slide.iconBg} flex items-center justify-center mb-6`}>
                <span className={`material-symbols-outlined ${slide.iconColor} text-2xl`}>{slide.icon}</span>
            </div>

            {/* Tag */}
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">{slide.tag}</p>

            {/* Title */}
            <h1 className="text-3xl font-black leading-tight tracking-tight mb-3 whitespace-pre-line">
                {slide.title}
            </h1>

            {/* Tagline */}
            <p className="text-sm font-semibold text-primary mb-5">{slide.tagline}</p>

            {/* Body */}
            <div className="flex-1 overflow-y-auto pr-1">
                {slide.body.split('\n\n').map((para, i) => (
                    <p key={i} className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">{para}</p>
                ))}
                {slide.hint && (
                    <p className="text-[11px] text-zinc-300 dark:text-zinc-600 italic mt-2">{slide.hint}</p>
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 mt-4">
                <button
                    onClick={onPrev}
                    className={`text-sm font-bold text-zinc-400 hover:text-charcoal dark:hover:text-white transition-colors ${current === 0 ? 'opacity-0 pointer-events-none' : ''
                        }`}
                >
                    ← Back
                </button>
                <button
                    onClick={onNext}
                    className="bg-charcoal dark:bg-white text-white dark:text-charcoal px-7 py-3 rounded-full font-black text-sm flex items-center gap-2 active:scale-[0.97] transition-all"
                >
                    {current === total - 1 ? 'Continue' : 'Next'}
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}

// ── Pledge step ───────────────────────────────────────────────────────────────
function PledgeStep({ onAccept, accepting }) {
    const [agreed, setAgreed] = useState(false);

    return (
        <div className="flex flex-col h-full">
            {/* Full progress */}
            <div className="flex gap-1.5 mb-8">
                {Array.from({ length: SLIDES.length }).map((_, i) => (
                    <div key={i} className="h-1 rounded-full flex-1 bg-primary" />
                ))}
            </div>

            <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full mb-6 w-fit">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Final step</span>
            </div>

            <h1 className="text-3xl font-black leading-tight mb-3">
                This Is Not<br />
                <span className="text-rose-500">A Game.</span>
            </h1>

            <p className="text-sm font-semibold text-zinc-400 mb-6">
                Before you start — read this carefully.
            </p>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    NoZero is a <span className="font-bold text-charcoal dark:text-white">public record of your discipline</span>.
                    Once you start, the clock is running. Every day you miss becomes part of your permanent history.
                    There are no resets, no second chances, no private mode.
                </p>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    This platform is built for people who are <span className="font-bold text-charcoal dark:text-white">ready to hold themselves accountable</span> —
                    not for people who want to feel productive. If you are here to experiment, close the app and come back when you are serious.
                </p>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    The people who thrive here are the ones who understand that <span className="font-bold text-charcoal dark:text-white">how you show up in the small things
                        is exactly how you show up in the big things</span>. Your profile will reflect that — honestly, publicly, permanently.
                </p>

                <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-black/5 dark:border-white/5">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        By accepting, you are agreeing to the{' '}
                        <Link
                            to="/pledge-policy"
                            className="font-bold text-primary underline underline-offset-2"
                            target="_blank"
                        >
                            NoZero Pledge Policy
                        </Link>
                        . This includes our public data policy, integrity standards, and community rules.
                    </p>
                </div>
            </div>

            {/* Checkbox */}
            <div className="pt-6 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <div
                        onClick={() => setAgreed(v => !v)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${agreed
                            ? 'bg-primary border-primary'
                            : 'border-black/20 dark:border-white/20 group-hover:border-primary'
                            }`}
                    >
                        {agreed && (
                            <span className="material-symbols-outlined text-charcoal text-sm font-bold" style={{ fontSize: '14px' }}>
                                check
                            </span>
                        )}
                    </div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        I understand this is a public, permanent record. I am ready to commit to showing up every day. I am not here to fool around.
                    </span>
                </label>

                <button
                    onClick={() => agreed && onAccept()}
                    disabled={!agreed || accepting}
                    className={`w-full py-4 rounded-full font-black text-base flex items-center justify-center gap-3 transition-all ${agreed && !accepting
                        ? 'bg-primary text-charcoal active:scale-[0.98] shadow-lg'
                        : 'bg-black/5 dark:bg-white/5 text-zinc-400 cursor-not-allowed'
                        }`}
                >
                    {accepting ? (
                        <>
                            <span className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin"></span>
                            Starting…
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">verified_user</span>
                            I Accept — Start My Audit
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-zinc-400">
                    Not ready?{' '}
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = '/login';
                        }}
                        className="font-bold underline underline-offset-2 hover:text-zinc-600 transition-colors"
                    >
                        Exit and come back when you are.
                    </button>
                </p>
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OnboardingFlow() {
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = new URLSearchParams(location.search).get('redirect') || '/';

    const [step, setStep] = useState(0); // 0..SLIDES.length-1 = walkthrough, SLIDES.length = pledge
    const [accepting, setAccepting] = useState(false);

    const isPledge = step === SLIDES.length;

    const handleAccept = async () => {
        setAccepting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.id) {
                await supabase
                    .from('profiles')
                    .update({ onboarding_complete: true })
                    .eq('id', session.user.id);
            }
        } catch (err) {
            console.warn('Onboarding update failed (non-blocking):', err);
        }
        // Use a hard redirect so TaskContext re-fetches the profile fresh from
        // Supabase. A soft navigate() would keep the stale user object (with
        // onboarding_complete: false) and Dashboard would bounce back to /onboarding.
        window.location.replace(redirectTo);
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-charcoal dark:text-white font-sans flex flex-col">
            <main className="flex-1 max-w-md mx-auto w-full px-5 pt-10 pb-8 flex flex-col">
                {isPledge ? (
                    <PledgeStep onAccept={handleAccept} accepting={accepting} />
                ) : (
                    <Slide
                        slide={SLIDES[step]}
                        current={step}
                        total={SLIDES.length}
                        onNext={() => setStep(s => s + 1)}
                        onPrev={() => setStep(s => Math.max(0, s - 1))}
                    />
                )}
            </main>
        </div>
    );
}
