import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { supabase } from '../lib/supabase';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = new URLSearchParams(location.search).get('redirect') || '/';
    const { signIn, user } = useTasks();

    // Login state
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Forgot password state
    const [forgotMode, setForgotMode] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMsg, setResetMsg] = useState(''); // success message
    const [resetError, setResetError] = useState('');

    React.useEffect(() => {
        if (user) navigate(redirectTo, { replace: true });
    }, [user, navigate, redirectTo]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signIn(email, password);
            navigate(redirectTo);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setResetLoading(true);
        setResetError('');
        setResetMsg('');
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setResetMsg(`Reset link sent to ${resetEmail.trim()}. Check your inbox (and spam folder).`);
        } catch (err) {
            setResetError(err.message);
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] dark:bg-black font-sans text-charcoal dark:text-white flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 w-full">
                <div className="w-full max-w-sm">

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 bg-[#D4E96E] rounded-2xl flex items-center justify-center mb-4 transform rotate-12 shadow-md">
                            <span className="material-symbols-outlined text-charcoal text-4xl transform -rotate-12">bolt</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-center">NoZero</h1>
                        <p className="text-charcoal/50 dark:text-white/50 text-[10px] mt-1 uppercase tracking-[0.3em] font-bold">Discipline Audit</p>
                    </div>

                    {/* ── FORGOT PASSWORD MODE ── */}
                    {forgotMode ? (
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-3 mb-5">
                                <button
                                    onClick={() => { setForgotMode(false); setResetMsg(''); setResetError(''); }}
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-base">arrow_back</span>
                                </button>
                                <div>
                                    <p className="font-extrabold text-sm">Reset Password</p>
                                    <p className="text-[10px] text-slate-400">We'll send a link to your email</p>
                                </div>
                            </div>

                            {resetMsg ? (
                                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
                                    <span className="material-symbols-outlined text-primary text-3xl block mb-2">mark_email_read</span>
                                    <p className="text-sm font-bold text-charcoal dark:text-white">{resetMsg}</p>
                                    <button
                                        onClick={() => { setForgotMode(false); setResetMsg(''); }}
                                        className="mt-4 text-xs font-bold text-primary underline"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    {resetError && (
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3">
                                            <p className="text-red-500 text-xs font-bold text-center">{resetError}</p>
                                        </div>
                                    )}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Your Email</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-charcoal dark:group-focus-within:text-white text-xl transition-colors">alternate_email</span>
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={e => setResetEmail(e.target.value)}
                                                required
                                                autoComplete="email"
                                                className="w-full h-14 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl pl-12 pr-4 focus:ring-2 focus:ring-[#D4E96E]/50 focus:border-[#D4E96E] text-charcoal dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-600 transition-all text-sm"
                                                placeholder="name@email.com"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={resetLoading}
                                        className="w-full bg-[#D4E96E] h-14 rounded-2xl flex items-center justify-between px-6 hover:brightness-105 active:scale-[0.98] transition-all group shadow-sm disabled:opacity-60"
                                    >
                                        <span className="text-charcoal font-bold text-base">
                                            {resetLoading ? 'Sending…' : 'Send Reset Link'}
                                        </span>
                                        <div className="w-9 h-9 bg-charcoal/10 rounded-full flex items-center justify-center group-hover:bg-charcoal/20 transition-colors">
                                            {resetLoading
                                                ? <span className="material-symbols-outlined text-charcoal animate-spin text-base">progress_activity</span>
                                                : <span className="material-symbols-outlined text-charcoal text-base">send</span>
                                            }
                                        </div>
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (

                        /* ── LOGIN MODE ── */
                        <>
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 mb-5">
                                    <p className="text-red-500 text-xs font-bold text-center">{error}</p>
                                </div>
                            )}

                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
                                <form onSubmit={handleLogin} className="space-y-5">

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-charcoal dark:group-focus-within:text-white text-xl transition-colors">alternate_email</span>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full h-14 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl pl-12 pr-4 focus:ring-2 focus:ring-[#D4E96E]/50 focus:border-[#D4E96E] text-charcoal dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-600 transition-all text-sm"
                                                placeholder="name@email.com"
                                                required
                                                autoComplete="email"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Password</label>
                                            <button
                                                type="button"
                                                onClick={() => { setForgotMode(true); setResetEmail(email); }}
                                                className="text-[10px] font-bold text-primary hover:underline"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-charcoal dark:group-focus-within:text-white text-xl transition-colors">lock</span>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full h-14 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl pl-12 pr-12 focus:ring-2 focus:ring-[#D4E96E]/50 focus:border-[#D4E96E] text-charcoal dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-600 transition-all text-sm"
                                                placeholder="••••••••"
                                                required
                                                autoComplete="current-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(v => !v)}
                                                tabIndex={-1}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 hover:text-charcoal dark:hover:text-white transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#D4E96E] h-14 rounded-2xl flex items-center justify-between px-6 hover:brightness-105 active:scale-[0.98] transition-all group shadow-sm shadow-[#D4E96E]/20 disabled:opacity-60 mt-2"
                                    >
                                        <span className="text-charcoal font-bold text-base">
                                            {loading ? 'Logging in…' : 'Login to NoZero'}
                                        </span>
                                        <div className="w-9 h-9 bg-charcoal/10 rounded-full flex items-center justify-center group-hover:bg-charcoal/20 transition-colors">
                                            {loading
                                                ? <span className="material-symbols-outlined text-charcoal animate-spin text-base">progress_activity</span>
                                                : <span className="material-symbols-outlined text-charcoal text-base">arrow_forward</span>
                                            }
                                        </div>
                                    </button>
                                </form>
                            </div>

                            {/* Signup link */}
                            <p className="text-sm text-slate-400 font-medium text-center mt-6">
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-charcoal dark:text-white font-bold hover:underline">Request access</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
