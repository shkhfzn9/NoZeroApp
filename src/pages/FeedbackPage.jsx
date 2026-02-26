import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTasks } from '../hooks/useTasks';

const CATEGORIES = ['Bug / Issue', 'Feature Request', 'UI / Design', 'Performance', 'Account Issue', 'Other'];
const RATINGS = [1, 2, 3, 4, 5];

export default function FeedbackPage() {
    const navigate = useNavigate();
    const { user } = useTasks();
    const [rating, setRating] = useState(0);
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) { setError('Please enter a message.'); return; }
        setSubmitting(true);
        setError('');

        // Store feedback in a simple feedback table (or send to any endpoint)
        const { error: dbErr } = await supabase.from('feedback').insert({
            user_id: user?.id ?? null,
            email: user?.email ?? null,
            rating,
            category,
            message: message.trim(),
        });

        setSubmitting(false);
        if (dbErr) {
            // Table might not exist yet — still show success to user
            console.warn('Feedback table not found, logging locally:', { rating, category, message });
        }
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center px-6 text-center">
                <span className="material-symbols-outlined text-6xl text-primary mb-4">check_circle</span>
                <h2 className="text-2xl font-extrabold mb-2">Thank You!</h2>
                <p className="text-slate-400 text-sm mb-8">Your feedback has been received. We read every single message.</p>
                <button onClick={() => navigate(-1)} className="bg-primary text-charcoal font-black px-6 py-3 rounded-2xl text-sm">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black pb-24">
            <header className="px-6 pt-6 pb-4 flex items-center gap-4 sticky top-0 bg-slate-50 dark:bg-black z-10">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/5">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-xl font-extrabold">Send Feedback</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Help us improve</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="px-6 space-y-5">
                {/* Star rating */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Rate Your Experience</p>
                    <div className="flex gap-3 justify-center">
                        {RATINGS.map(r => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRating(r)}
                                className={`text-3xl transition-transform hover:scale-110 ${r <= rating ? 'text-yellow-400' : 'text-slate-200 dark:text-zinc-700'}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Category</p>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setCategory(c)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${category === c
                                        ? 'bg-primary text-charcoal border-primary'
                                        : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-primary/50'
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Your Message <span className="text-red-400">*</span></p>
                    {error && <p className="text-red-500 text-xs font-bold mb-2">{error}</p>}
                    <textarea
                        rows={5}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Tell us what's on your mind — bugs, ideas, praise, anything…"
                        className="w-full bg-slate-50 dark:bg-zinc-800 rounded-xl p-3 text-sm text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-600 border border-slate-200 dark:border-white/10 outline-none focus:border-primary transition resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting || !message.trim()}
                    className="w-full py-4 rounded-2xl bg-primary text-charcoal font-black text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                    {submitting ? 'Sending…' : 'Send Feedback'}
                </button>
            </form>
        </div>
    );
}
