import React from 'react';
import clsx from 'clsx';

export default function FirstTaskPopup({ onClose }) {
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-charcoal dark:bg-zinc-900 text-white p-8 rounded-[32px] shadow-2xl w-full max-w-md border border-primary/30 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>

                <div className="flex items-start gap-4 mb-8 relative z-10">
                    <div className="p-4 bg-primary/10 rounded-full shrink-0 mt-1">
                        <span className="material-symbols-outlined text-primary text-3xl">lock_clock</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black mb-3 text-primary uppercase tracking-tighter leading-tight mt-1">Discipline Protocol</h3>
                        <div className="space-y-4 text-sm text-gray-300 leading-relaxed font-medium mt-4">
                            <p>
                                You've scheduled your first task today. Here are the <strong className="text-white">non-negotiable rules</strong>:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Tasks <strong>strictly unlock exactly 5 minutes before</strong> the scheduled start time.</li>
                                <li>You <strong>MUST</strong> press the <strong className="text-white">Start Task</strong> button to track your start.</li>
                                <li>When finished, you <strong>MUST</strong> press the <strong className="text-white">End Task</strong> button. It unlocks 5 minutes before the scheduled end time.</li>
                            </ul>
                            <p className="mt-4 border-l-4 border-primary/50 pl-3">
                                <em className="text-gray-400">Why? We log actual execution times against your intended estimates to grade your real-world discipline. This is not a casual checklist.</em>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 relative z-10 w-full mt-2">
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-xl font-black text-sm bg-primary text-charcoal hover:bg-primary/90 transition-colors uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                        I UNDERSTAND
                    </button>
                </div>
            </div>
        </div>
    );
}
