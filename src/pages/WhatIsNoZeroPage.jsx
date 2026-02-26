import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function WhatIsNoZeroPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-charcoal dark:text-white font-sans">
            <main className="max-w-md mx-auto px-5 pt-8 pb-20 space-y-10">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-zinc-400 hover:text-charcoal dark:hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back
                </button>

                {/* Hero */}
                <section className="space-y-4">
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Not for everyone</span>
                    </div>

                    <h1 className="text-4xl font-black leading-tight tracking-tight">
                        Most people<br />
                        <span className="text-primary">won't last a week.</span>
                    </h1>

                    <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        NoZero is a daily discipline audit system. Every day you either showed up — or you didn't.
                        There is no middle ground, no excuses logged, no reasons stored.
                        Just a public record of who you actually are.
                    </p>
                </section>

                {/* Divider */}
                <div className="h-px bg-black/5 dark:bg-white/5" />

                {/* The brutal truth */}
                <section className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">The brutal truth</h2>
                    <div className="space-y-3">
                        {[
                            { icon: 'close', text: 'If you need motivation to show up, this is not for you.' },
                            { icon: 'close', text: 'If you quit when things get hard, this will expose you — publicly.' },
                            { icon: 'close', text: 'If your consistency depends on how you feel, don\'t join.' },
                            { icon: 'close', text: 'If you are looking for a community to cheer you on, look elsewhere.' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="material-symbols-outlined text-rose-500 text-sm">{item.icon}</span>
                                </div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Divider */}
                <div className="h-px bg-black/5 dark:bg-white/5" />

                {/* Who it is for */}
                <section className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">But if you show up every day —</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Something changes. You stop having to talk about who you are or what you do.
                        Your record speaks. Your streak speaks. Your public audit speaks.
                    </p>
                    <div className="space-y-3">
                        {[
                            { icon: 'check_circle', text: 'Employers, collaborators, and clients can see your real work ethic — not your resume claims.' },
                            { icon: 'check_circle', text: 'People who want to build with serious people will find you and approach you.' },
                            { icon: 'check_circle', text: 'Your proof of consistency becomes a signal that separates you from everyone who only talks.' },
                            { icon: 'check_circle', text: 'Over time, your profile becomes a track record that no interview question can replicate.' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="material-symbols-outlined text-primary text-sm">{item.icon}</span>
                                </div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Divider */}
                <div className="h-px bg-black/5 dark:bg-white/5" />

                {/* How it works — minimal */}
                <section className="space-y-5">
                    <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">How it works</h2>
                    <div className="space-y-4">
                        {[
                            { step: '01', title: 'You commit to daily tasks', body: 'Real tasks. The ones that actually move the needle in your life or work.' },
                            { step: '02', title: 'You audit yourself publicly', body: 'Every day is marked — done or missed. You cannot hide from your own record.' },
                            { step: '03', title: 'Your profile becomes your proof', body: 'A shareable, verifiable history of how you actually operate. No filters.' },
                            { step: '04', title: 'Others can find you', body: 'People who value discipline can see your record and choose to connect, hire, or collaborate.' },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <span className="text-[11px] font-black text-primary mt-0.5 w-6 flex-shrink-0">{item.step}</span>
                                <div>
                                    <p className="text-sm font-bold text-charcoal dark:text-white">{item.title}</p>
                                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{item.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Divider */}
                <div className="h-px bg-black/5 dark:bg-white/5" />

                {/* Closing thought */}
                <section className="bg-charcoal dark:bg-zinc-800 rounded-[28px] p-7 space-y-3">
                    <p className="text-white text-base font-bold leading-snug">
                        "The people who will thrive here are not the ones who are the most talented.
                        They are the ones who refuse to let a day go to zero."
                    </p>
                    <p className="text-zinc-400 text-xs font-medium">— NoZero</p>
                </section>

                {/* No CTA — intentional */}
                <p className="text-center text-xs text-zinc-400 leading-relaxed px-4">
                    If this resonates with you, you already know what to do.<br />
                    If it doesn't — that's okay too. This was never for everyone.
                </p>

            </main>
        </div>
    );
}
