import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { supabase } from '../lib/supabase';

export default function Signup() {
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = new URLSearchParams(location.search).get('redirect') || '/';
    const { signUp } = useTasks();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });

    // Username uniqueness check
    const [usernameStatus, setUsernameStatus] = useState('idle'); // 'idle' | 'checking' | 'taken' | 'available'
    const debounceRef = useRef(null);

    const handleUsernameChange = (val) => {
        setFormData(f => ({ ...f, username: val }));
        if (!val.trim()) { setUsernameStatus('idle'); return; }

        setUsernameStatus('checking');
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id')
                .ilike('username', val.trim())
                .limit(1);
            setUsernameStatus(data && data.length > 0 ? 'taken' : 'available');
        }, 500);
    };

    useEffect(() => () => clearTimeout(debounceRef.current), []);

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!formData.username.trim()) { setError('Username is required.'); return; }
        if (usernameStatus === 'taken') { setError('That username is already taken.'); return; }
        if (usernameStatus === 'checking') { setError('Still checking username availability…'); return; }

        setLoading(true);
        setError('');
        try {
            const data = await signUp(formData.email, formData.password, formData.username.trim());
            if (data?.session) {
                // Always send new users through onboarding first.
                // Pass the original redirect so onboarding can forward them there after the pledge.
                const onboardingUrl = redirectTo !== '/'
                    ? `/onboarding?redirect=${encodeURIComponent(redirectTo)}`
                    : '/onboarding';
                navigate(onboardingUrl);
            } else if (data?.user) {
                setError('Account created! Please check your email to confirm registration before logging in.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const usernameHint = {
        idle: null,
        checking: { color: 'text-slate-400', icon: 'progress_activity', spin: true, text: 'Checking availability…' },
        taken: { color: 'text-red-500', icon: 'cancel', spin: false, text: 'Username already taken' },
        available: { color: 'text-primary', icon: 'check_circle', spin: false, text: 'Username available!' },
    }[usernameStatus];

    const canSubmit = !loading && formData.username.trim() && formData.email && formData.password
        && usernameStatus !== 'taken' && usernameStatus !== 'checking';

    return (
        <div className="min-h-screen bg-[#F5F5F5] dark:bg-black font-sans text-charcoal dark:text-white flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 w-full">
                <div className="w-full max-w-sm">

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-14 h-14 bg-charcoal dark:bg-white rounded-2xl flex items-center justify-center mb-3 transform -rotate-6 shadow-md">
                            <span className="material-symbols-outlined text-[#D4E96E] dark:text-charcoal text-3xl transform rotate-6">person_add</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-center">Join NoZero</h1>
                        <p className="text-charcoal/50 dark:text-white/50 text-[10px] mt-1 uppercase tracking-[0.3em] font-bold">Start Your Audit</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 mb-5">
                            <p className="text-red-500 text-xs font-bold text-center">{error}</p>
                        </div>
                    )}

                    {/* Form card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
                        <form onSubmit={handleSignup} className="space-y-4">

                            {/* Username */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                                    Username <span className="text-red-400">*</span>
                                </label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-charcoal dark:group-focus-within:text-white text-xl transition-colors">badge</span>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={e => handleUsernameChange(e.target.value)}
                                        required
                                        maxLength={30}
                                        className={`w-full h-14 bg-slate-50 dark:bg-zinc-800 border rounded-2xl pl-12 pr-10 focus:ring-2 focus:ring-[#D4E96E]/50 text-charcoal dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-600 transition-all text-sm ${usernameStatus === 'taken' ? 'border-red-400 focus:border-red-400' :
                                            usernameStatus === 'available' ? 'border-primary focus:border-primary' :
                                                'border-slate-200 dark:border-zinc-700 focus:border-[#D4E96E]'
                                            }`}
                                        placeholder="Operator Name"
                                        autoComplete="username"
                                    />
                                    {usernameHint && (
                                        <span className={`material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-base ${usernameHint.color} ${usernameHint.spin ? 'animate-spin' : ''}`}>
                                            {usernameHint.icon}
                                        </span>
                                    )}
                                </div>
                                {usernameHint && (
                                    <p className={`text-[10px] font-bold ml-1 ${usernameHint.color}`}>{usernameHint.text}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-charcoal dark:group-focus-within:text-white text-xl transition-colors">alternate_email</span>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="w-full h-14 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl pl-12 pr-4 focus:ring-2 focus:ring-[#D4E96E]/50 focus:border-[#D4E96E] text-charcoal dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-600 transition-all text-sm"
                                        placeholder="name@email.com"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-charcoal dark:group-focus-within:text-white text-xl transition-colors">lock</span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={6}
                                        className="w-full h-14 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl pl-12 pr-12 focus:ring-2 focus:ring-[#D4E96E]/50 focus:border-[#D4E96E] text-charcoal dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-600 transition-all text-sm"
                                        placeholder="Min 6 characters"
                                        autoComplete="new-password"
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
                                disabled={!canSubmit}
                                className="w-full bg-charcoal dark:bg-white h-14 rounded-2xl flex items-center justify-between px-6 hover:opacity-90 active:scale-[0.98] transition-all group shadow-sm disabled:opacity-40 mt-2"
                            >
                                <span className="text-white dark:text-charcoal font-bold text-base">
                                    {loading ? 'Creating Account…' : 'Create Account'}
                                </span>
                                <div className="w-9 h-9 bg-white/10 dark:bg-charcoal/10 rounded-full flex items-center justify-center group-hover:bg-white/20 dark:group-hover:bg-charcoal/20 transition-colors">
                                    {loading
                                        ? <span className="material-symbols-outlined text-white dark:text-charcoal animate-spin text-base">progress_activity</span>
                                        : <span className="material-symbols-outlined text-white dark:text-charcoal text-base">arrow_forward</span>
                                    }
                                </div>
                            </button>
                        </form>
                    </div>

                    {/* Login link */}
                    <p className="text-sm text-slate-400 font-medium text-center mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-charcoal dark:text-white font-bold hover:underline">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
