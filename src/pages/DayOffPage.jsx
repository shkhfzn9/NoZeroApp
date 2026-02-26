import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';

export default function DayOffPage() {
    const navigate = useNavigate();
    const { markDayOff, isDayOff } = useTasks();
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const todayStr = new Date().toLocaleDateString('en-CA');
    const alreadyOff = isDayOff(todayStr);

    const handleConfirm = async () => {
        if (!agreed) return;
        setLoading(true);
        setError('');
        const result = await markDayOff(todayStr);
        setLoading(false);
        if (result?.success) {
            navigate('/', { state: { dayOffActivated: true } });
        } else {
            setError(result?.error || 'Something went wrong.');
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-charcoal dark:text-white min-h-screen flex justify-center items-start font-sans">
            <div className="w-full max-w-[430px] min-h-screen relative overflow-hidden pb-10">

                {/* Hero */}
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 dark:from-zinc-900 dark:to-zinc-800 px-8 pt-16 pb-12">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 left-8 w-32 h-32 bg-amber-400 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-4 w-40 h-40 bg-orange-300 rounded-full blur-3xl" />
                    </div>

                    {/* Back button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-6 left-6 w-10 h-10 bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
                    >
                        <span className="material-symbols-outlined text-charcoal dark:text-white">arrow_back</span>
                    </button>

                    <div className="relative z-10 text-center">
                        <div className="w-20 h-20 bg-amber-400/20 dark:bg-amber-400/10 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-400/20">
                            <span className="text-5xl">🌿</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Rest is Part of<br />the Journey</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            Even the best athletes take a day off.<br />Your discipline will be here tomorrow.
                        </p>
                    </div>
                </div>

                {/* Rules Section */}
                <div className="px-6 py-8 space-y-5">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Day Off Rules</h2>

                    {[
                        {
                            icon: 'event_available',
                            color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
                            title: 'Max 2 days per week',
                            desc: 'You get a maximum of 2 day-offs in any given Monday–Sunday week.'
                        },
                        {
                            icon: 'block',
                            color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10',
                            title: 'No carry-forward',
                            desc: "Unused day-offs don't roll over to next week. It resets every Monday."
                        },
                        {
                            icon: 'analytics',
                            color: 'text-sky-500 bg-sky-50 dark:bg-sky-500/10',
                            title: 'Tasks & scores excluded',
                            desc: "Today's tasks won't count toward your score, streak, or analytics."
                        },
                        {
                            icon: 'warning_amber',
                            color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
                            title: 'Minimum 5 active days',
                            desc: 'To stay consistent you must have at least 5 productive days per week.'
                        },
                        {
                            icon: 'wb_sunny',
                            color: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10',
                            title: 'Prefer weekends',
                            desc: 'We recommend Saturdays & Sundays. Weekday day-offs count toward your 2-day limit too.'
                        },
                        {
                            icon: 'check_circle',
                            color: 'text-primary bg-primary/10',
                            title: 'Tasks still visible',
                            desc: "You can still add tasks today — they'll be labeled 'Day Off' and earn no points."
                        },
                    ].map((rule) => (
                        <div key={rule.title} className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${rule.color}`}>
                                <span className="material-symbols-outlined text-xl">{rule.icon}</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm">{rule.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{rule.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Motivational Quote */}
                <div className="mx-6 bg-charcoal dark:bg-zinc-900 text-white rounded-[28px] px-6 py-5 mb-8 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
                    <span className="text-3xl mb-2 block">💛</span>
                    <p className="text-sm leading-relaxed font-medium">"Give time to your family and friends today. Rest, reconnect, and come back stronger tomorrow."</p>
                </div>

                {/* Disclaimer + Confirm */}
                {alreadyOff ? (
                    <div className="mx-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-[24px] p-5 text-center">
                        <span className="material-symbols-outlined text-emerald-500 text-3xl block mb-2">check_circle</span>
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Today is already marked as your day off.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 w-full py-3 rounded-2xl bg-charcoal dark:bg-white text-white dark:text-charcoal font-bold text-sm"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="mx-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-700 rounded-[28px] p-6 space-y-5">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Confirmation</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            By confirming, you agree that today's tasks and progress won't count toward your score or streak. This action <strong>cannot be undone</strong> for today.
                        </p>

                        <label className="flex items-start gap-3 cursor-pointer">
                            <div
                                onClick={() => setAgreed(!agreed)}
                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors mt-0.5 ${agreed ? 'bg-primary border-primary' : 'border-slate-300 dark:border-zinc-600'}`}
                            >
                                {agreed && <span className="material-symbols-outlined text-charcoal text-sm">check</span>}
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                                I understand that today will be a day off and I commit to returning disciplined tomorrow.
                            </span>
                        </label>

                        {error && (
                            <p className="text-xs text-rose-500 font-medium">{error}</p>
                        )}

                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex-1 py-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-bold text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!agreed || loading}
                                className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-opacity ${agreed && !loading ? 'bg-amber-400 text-charcoal hover:bg-amber-500' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400 cursor-not-allowed'}`}
                            >
                                {loading ? 'Marking...' : 'Take Day Off 🌿'}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
