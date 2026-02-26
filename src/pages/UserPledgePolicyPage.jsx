import React from 'react';
import { useNavigate } from 'react-router-dom';

const Section = ({ icon, title, children }) => (
    <div className="space-y-3">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest">{title}</h2>
        </div>
        <div className="pl-12 space-y-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {children}
        </div>
    </div>
);

export default function UserPledgePolicyPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-charcoal dark:text-white font-sans">
            <main className="max-w-md mx-auto px-5 pt-8 pb-24 space-y-8">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-zinc-400 hover:text-charcoal dark:hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back
                </button>

                {/* Header */}
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">NoZero Pledge Policy</p>
                    <h1 className="text-3xl font-black leading-tight">The Rules<br />of the Audit.</h1>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        Read this before you agree. This is what you are signing up to hold yourself to.
                    </p>
                </div>

                <div className="h-px bg-black/5 dark:bg-white/5" />

                {/* Sections */}
                <div className="space-y-8">

                    <Section icon="event_available" title="1. What NoZero Tracks">
                        <p>
                            Every day you are on NoZero, one of three things happens: you complete your assigned tasks, you miss them, or you have no tasks scheduled.
                            All of this is recorded and displayed publicly on your profile. There is no private mode.
                        </p>
                        <p>
                            Your streak, consistency score, rank, and tier are all computed from this record — automatically, without human adjustment.
                        </p>
                    </Section>

                    <div className="h-px bg-black/5 dark:bg-white/5" />

                    <Section icon="visibility" title="2. Your Profile is Public">
                        <p>
                            Your username, streak, annual consistency graph, tier, and rank are visible to anyone who visits your profile link — even people who are not on NoZero.
                        </p>
                        <p>
                            You cannot hide your record.
                            If you miss days, that is shown. If you streak for 90 days, that is also shown.
                            The system reflects reality, not effort or intention.
                        </p>
                    </Section>

                    <div className="h-px bg-black/5 dark:bg-white/5" />

                    <Section icon="close" title="3. What Counts as a Miss">
                        <p>
                            A day is marked as <span className="font-semibold text-rose-500">missed</span> if you had tasks scheduled and did not mark them complete before midnight (your local time).
                            There is no grace period, no retroactive editing, and no appeals process.
                        </p>
                        <p>
                            Misses do not erase your history. They become part of your record. The honest record of who you actually are is what makes this meaningful — for you and for anyone who views your profile.
                        </p>
                    </Section>

                    <div className="h-px bg-black/5 dark:bg-white/5" />

                    <Section icon="shield" title="4. Integrity & Community Standards">
                        <ul className="space-y-2 list-none">
                            {[
                                'You will not create multiple accounts to reset your record.',
                                'You will not mark tasks as complete if you did not actually do them.',
                                'You will not use the platform to misrepresent your consistency to others.',
                                'You understand that your public profile may be viewed by employers, collaborators, or anyone you share it with.',
                                'You will not harass other users, challenge them dishonestly, or exploit the friend/leaderboard system.',
                            ].map((rule, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                                    <span>{rule}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <div className="h-px bg-black/5 dark:bg-white/5" />

                    <Section icon="lock" title="5. Your Data & Privacy">
                        <p>
                            Your email address is never shown publicly. Only your username, avatar (if set), and performance metrics are visible on your public profile.
                        </p>
                        <p>
                            NoZero does not sell your data. Your task content (what the task is called) is stored securely and not displayed on your public profile unless you explicitly share proof links.
                        </p>
                        <p>
                            You may delete your account at any time from Settings. Deletion is permanent and cannot be reversed.
                        </p>
                    </Section>

                    <div className="h-px bg-black/5 dark:bg-white/5" />

                    <Section icon="gavel" title="6. Consequences of Violation">
                        <p>
                            Accounts found to be violating the integrity policy may be suspended or permanently removed by the NoZero admin team.
                            There is no formal appeal. The system is built on trust — abuse it and you lose access.
                        </p>
                    </Section>

                    <div className="h-px bg-black/5 dark:bg-white/5" />

                    {/* Final note */}
                    <div className="bg-charcoal dark:bg-zinc-800 rounded-[24px] p-6 space-y-2">
                        <p className="text-white text-sm font-bold">
                            This is a platform for people who take themselves seriously.
                        </p>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                            If you read all of this and still feel ready — that's a good sign. Go back and accept the pledge.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="w-full py-4 rounded-full border border-black/10 dark:border-white/10 text-sm font-bold text-zinc-500 hover:text-charcoal dark:hover:text-white transition-colors"
                >
                    ← Back to Pledge
                </button>

            </main>
        </div>
    );
}
