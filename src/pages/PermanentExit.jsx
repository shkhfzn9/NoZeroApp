import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';

export default function PermanentExit() {
    const [accepted, setAccepted] = useState(false);
    const [terminated, setTerminated] = useState(false);
    const { user, loading } = useTasks();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0A] text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl">hg_logo</span>
        </div>
    );
    if (!user) return <Navigate to="/login" replace />;

    const handleQuit = () => {
        if (accepted) {
            setTerminated(true);
        }
    };

    if (terminated) {
        return (
            <div className="bg-black w-full h-screen flex items-center justify-center p-0 m-0 overflow-hidden">
                <p className="text-white font-sans text-2xl uppercase tracking-[0.5em] animate-pulse">Disconnected</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#0A0A0A] min-h-screen flex flex-col items-center justify-center p-0 m-0 overflow-hidden font-sans">

            <main className="relative w-full max-w-[430px] min-h-screen bg-white dark:bg-[#0A0A0A] flex flex-col pt-6 pb-10 px-6 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                    <span className="text-[600px] font-bold text-[#D91E1E] leading-none">X</span>
                </div>

                <header className="mt-12 mb-16 relative z-10">
                    <div className="bg-[#111] dark:bg-zinc-900 py-4 px-6 mb-8">
                        <h1 className="text-white text-xl font-extrabold uppercase tracking-widest text-center">
                            EXIT PROTOCOL: PERMANENT TERMINATION
                        </h1>
                    </div>
                    <div className="text-center px-4 space-y-6">
                        <h2 className="text-4xl font-extrabold text-[#111] dark:text-zinc-100 leading-tight">
                            Return to your mediocre existence.
                        </h2>
                        <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
                            This environment was built for the elite, not for those who seek the comfort of failure.
                        </p>
                    </div>
                </header>

                <section className="mt-auto relative z-10">
                    <div className="border-2 border-[#D91E1E] p-6 bg-white dark:bg-zinc-950 mb-6">
                        <label className="flex items-start gap-4 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                className="mt-1 rounded-none border-2 border-[#111] text-[#111] focus:ring-0 w-5 h-5"
                            />
                            <span className="text-[#111] dark:text-white font-bold leading-tight uppercase text-sm">
                                I accept my lack of discipline and wish to resign from all accountability.
                            </span>
                        </label>
                    </div>
                    <button
                        onClick={handleQuit}
                        disabled={!accepted}
                        className={`w-full bg-[#111] dark:bg-zinc-800 text-white font-bold py-6 px-4 uppercase tracking-tighter text-lg transition-all active:scale-[0.98] ${!accepted ? 'opacity-40 cursor-not-allowed' : 'hover:bg-zinc-800'}`}
                    >
                        CONFIRM FAILURE & QUIT
                    </button>
                </section>

                <footer className="mt-12 text-center relative z-10">
                    <p className="text-zinc-400 dark:text-zinc-600 font-medium uppercase tracking-widest text-xs">
                        NoZero will not remember you.
                    </p>
                </footer>

            </main>
        </div>
    );
}
