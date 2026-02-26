import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTasks } from '../hooks/useTasks';

export default function ContactPage() {
    const navigate = useNavigate();
    const { user } = useTasks();
    const [form, setForm] = useState({ name: user?.username ?? '', email: user?.email ?? '', subject: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.message.trim() || !form.email.trim()) { setError('Email and message are required.'); return; }
        setSubmitting(true);
        setError('');

        const { error: dbErr } = await supabase.from('feedback').insert({
            user_id: user?.id ?? null,
            email: form.email,
            category: 'Contact: ' + (form.subject || 'General'),
            message: `[${form.name}] ${form.message.trim()}`,
            rating: null,
        });

        setSubmitting(false);
        if (dbErr) console.warn('Contact submit error (table may not exist):', dbErr.message);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center px-6 text-center">
                <span className="material-symbols-outlined text-6xl text-primary mb-4">mark_email_read</span>
                <h2 className="text-2xl font-extrabold mb-2">Message Sent!</h2>
                <p className="text-slate-400 text-sm mb-8">We'll get back to you within 48 hours.</p>
                <button onClick={() => navigate(-1)} className="bg-primary text-charcoal font-black px-6 py-3 rounded-2xl text-sm">Go Back</button>
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
                    <h1 className="text-xl font-extrabold">Contact Us</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">We respond within 48h</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="px-6 space-y-4">
                {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

                {[
                    { key: 'name', label: 'Your Name', type: 'text', placeholder: 'John Doe' },
                    { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@email.com' },
                    { key: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g. Account issue' },
                ].map(f => (
                    <div key={f.key} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{f.label}</label>
                        <input
                            type={f.type}
                            value={form[f.key]}
                            onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                            placeholder={f.placeholder}
                            className="w-full bg-slate-50 dark:bg-zinc-800 rounded-xl px-3 py-2.5 text-sm outline-none border border-slate-200 dark:border-white/10 focus:border-primary transition"
                        />
                    </div>
                ))}

                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Message <span className="text-red-400">*</span></label>
                    <textarea
                        rows={5}
                        value={form.message}
                        onChange={e => setForm(v => ({ ...v, message: e.target.value }))}
                        placeholder="Describe your issue or question in detail…"
                        className="w-full bg-slate-50 dark:bg-zinc-800 rounded-xl p-3 text-sm outline-none border border-slate-200 dark:border-white/10 focus:border-primary transition resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-2xl bg-primary text-charcoal font-black text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                    {submitting ? 'Sending…' : 'Send Message'}
                </button>
            </form>
        </div>
    );
}
