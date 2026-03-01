import React, { useState } from 'react';
import clsx from 'clsx';

export default function FirstTaskPopup({ onClose }) {
    const [isChecked, setIsChecked] = useState(false);

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-charcoal dark:bg-zinc-900 text-white p-6 md:p-8 rounded-[32px] shadow-2xl w-full max-w-md border border-primary/30 animate-in zoom-in-95 duration-300 relative overflow-hidden my-auto max-h-full flex flex-col">
                {/* Glow effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl shrink-0 pointer-events-none"></div>

                <div className="flex items-start gap-3 md:gap-4 mb-6 md:mb-8 relative z-10 shrink-0">
                    <div className="p-3 md:p-4 bg-primary/10 rounded-full shrink-0 mt-1">
                        <span className="material-symbols-outlined text-primary text-2xl md:text-3xl">lock_clock</span>
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-black mb-2 md:mb-3 text-primary uppercase tracking-tighter leading-tight mt-1">Discipline Protocol</h3>
                    </div>
                </div>

                <div className="space-y-4 text-sm text-gray-300 leading-relaxed font-medium overflow-y-auto pr-2 custom-scrollbar relative z-10">
                    <p>
                        You've scheduled your first task today. Here are the <strong className="text-white">non-negotiable rules</strong>:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>Tasks <strong>strictly unlock exactly 5 minutes before</strong> the scheduled start time.</li>
                        <li>You <strong>MUST</strong> press the <strong className="text-white">Start Task</strong> button to track your start. <strong>Failure to start marks it as missed and penalizes your consistency score.</strong></li>
                        <li>When finished, you <strong>MUST</strong> press the <strong className="text-white">End Task</strong> button. It unlocks 5 minutes before the scheduled end time.</li>
                        <li><strong>Safe Zone:</strong> You need a minimum of <strong>5 points</strong> daily. If you earn less than 5 points, you will lose <strong>10 consistency score points</strong>.</li>
                        <li><strong>Streaks:</strong> To record and extend your daily streak, you must earn exactly or more than <strong>10 points</strong>.</li>
                    </ul>
                    <p className="mt-4 border-l-4 border-primary/50 pl-3 pb-2">
                        <em className="text-gray-400">Why? We log actual execution times against your intended estimates to grade your real-world discipline. This is not a casual checklist.</em>
                    </p>
                </div>

                <div className="flex flex-col gap-4 relative z-10 w-full mt-6 shrink-0 pt-4 border-t border-white/5">

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="mt-0.5">
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => setIsChecked(e.target.checked)}
                                className="w-5 h-5 rounded border-white/20 bg-zinc-800 text-primary focus:ring-primary focus:ring-offset-zinc-900 transition-all cursor-pointer"
                            />
                        </div>
                        <span className="text-sm text-gray-400 leading-relaxed font-medium group-hover:text-gray-300 transition-colors">
                            I have read, understood, and agree to follow these rules diligently.
                        </span>
                    </label>

                    <button
                        onClick={onClose}
                        disabled={!isChecked}
                        className={clsx(
                            "w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all",
                            isChecked
                                ? "bg-primary text-charcoal hover:bg-primary/90 shadow-lg shadow-primary/20"
                                : "bg-zinc-800 text-gray-500 cursor-not-allowed"
                        )}
                    >
                        I UNDERSTAND
                    </button>
                </div>
            </div>
        </div>
    );
}
