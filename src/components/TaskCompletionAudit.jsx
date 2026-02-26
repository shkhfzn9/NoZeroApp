import React, { useState } from 'react';

export default function TaskCompletionAudit({
    completionStatus,
    setCompletionStatus,
    performanceReason,
    setPerformanceReason,
    distractions,
    setDistractions,
    handleAddDistraction,
    handleSave,
    // Distraction Input Props
    distractionCause,
    setDistractionCause,
    distractionFreq,
    setDistractionFreq,
    distractionDuration,
    setDistractionDuration,
    extraTime,
    isOverdue
}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Derived state for summary (passed props or calculated here? Calculated here is fine for display)
    const totalDistractionTime = distractions.reduce((acc, curr) => acc + parseInt(curr.duration), 0);

    return (
        <>
            {/* Completion Status */}
            <section id="completion-section" className="px-6 py-6 scroll-mt-20">
                <h2 className="text-base font-semibold mb-4 text-charcoal dark:text-white">Did you complete the task?</h2>
                <div className="grid grid-cols-3 gap-3">
                    {['yes', 'half', 'no'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setCompletionStatus(status)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 shadow-sm transition-colors ${completionStatus === status
                                ? 'border-primary bg-primary/10'
                                : 'border-transparent bg-white dark:bg-card-dark dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-3xl mb-1 ${status === 'yes' ? 'text-lime-500' : status === 'half' ? 'text-violet-400' : 'text-red-400'
                                }`}>
                                {status === 'yes' ? 'check_circle' : status === 'half' ? 'adjust' : 'cancel'}
                            </span>
                            <span className="text-sm font-bold capitalize text-charcoal dark:text-white">{status}</span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="px-6 py-4">
                <div className="bg-white dark:bg-card-dark border border-charcoal/5 dark:border-white/5 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <label className="text-[10px] uppercase tracking-wider font-bold text-charcoal/40 dark:text-white/40 mb-1 block">Extra Time Logged</label>
                            <p className={`text-sm font-bold font-mono tracking-tight ${isOverdue ? 'text-red-500' : 'text-charcoal dark:text-white'}`}>
                                {extraTime}
                            </p>
                        </div>
                        <p className="text-[9px] text-charcoal/40 dark:text-white/40 italic text-right max-w-[120px]">
                            {isOverdue ? "Time exceeded beyond schedule" : "Time within schedule"}
                        </p>
                    </div>
                </div>
            </section>

            {/* Congratulations Card for On-Time */}
            {!isOverdue && (
                <section className="px-6 pb-4">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 shadow-lg text-white">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-3xl bg-white/20 p-2 rounded-full">celebration</span>
                            <div>
                                <h3 className="font-bold text-lg leading-tight mb-1">Congratulations you are on time!</h3>
                                <p className="text-white/90 text-xs font-medium leading-relaxed">
                                    According to stats 95% fail here. Keep up the streak!
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Performance/Feeling Section */}
            <section className="px-6 py-6 border-t border-charcoal/5 dark:border-white/5">
                <h2 className="text-base font-semibold mb-4 text-charcoal dark:text-white">
                    {isOverdue ? "Reasons for ending task late" : "How was the work?"}
                </h2>
                <div className="grid grid-cols-3 gap-3">
                    {isOverdue ? (
                        // Overdue Options
                        [
                            { id: 'deep_work', label: 'Deep Work', icon: 'bolt' },
                            { id: 'distraction', label: 'Distractions', icon: 'notifications_off' },
                            { id: 'not_disciplined', label: 'Not Disciplined', icon: 'error' }
                        ].map((reason) => (
                            <button
                                key={reason.id}
                                onClick={() => setPerformanceReason(reason.id)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border shadow-sm transition-all ${performanceReason === reason.id
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-charcoal/10 dark:border-white/10 bg-white dark:bg-card-dark hover:border-primary/50 text-charcoal dark:text-white'
                                    }`}
                            >
                                <span className="material-symbols-outlined mb-1">{reason.icon}</span>
                                <span className="text-[10px] font-bold text-center leading-tight">{reason.label}</span>
                            </button>
                        ))
                    ) : (
                        // On-Time Options
                        [
                            { id: 'excellent', label: 'Excellent', icon: 'sentiment_very_satisfied' },
                            { id: 'good', label: 'Good', icon: 'sentiment_satisfied' },
                            { id: 'motivating', label: 'Motivating', icon: 'sentiment_excited' } // using sentiment_excited or similar
                        ].map((feeling) => (
                            <button
                                key={feeling.id}
                                onClick={() => setPerformanceReason(feeling.id)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border shadow-sm transition-all ${performanceReason === feeling.id
                                    ? 'border-green-500 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 dark:border-green-500'
                                    : 'border-charcoal/10 dark:border-white/10 bg-white dark:bg-card-dark hover:border-green-500/50 text-charcoal dark:text-white'
                                    }`}
                            >
                                <span className="material-symbols-outlined mb-1">{feeling.icon}</span>
                                <span className="text-[10px] font-bold text-center leading-tight">{feeling.label}</span>
                            </button>
                        ))
                    )}
                </div>
            </section>

            {/* Distraction Audit */}
            <section className="px-6 py-6 border-t border-primary/10 mt-4">
                <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-base font-semibold text-charcoal dark:text-white">Distraction Audit</h2>
                    <span className="material-symbols-outlined text-primary/40 text-sm">info</span>
                </div>
                <p className="text-xs text-charcoal/50 dark:text-white/50 leading-relaxed mb-6 italic">
                    Log any distractions that occurred. This data is for your personal improvement.
                </p>

                {/* Distraction Entries List */}
                <div className="space-y-4">
                    {distractions.map((dist) => (
                        <div key={dist.id} className="bg-white dark:bg-card-dark border border-charcoal/5 dark:border-white/5 rounded-xl p-3 shadow-sm flex justify-between items-center">
                            <div>
                                <p className="font-bold text-sm text-charcoal dark:text-white">{dist.cause}</p>
                                <p className="text-[10px] text-charcoal/60 dark:text-white/60">{dist.frequency} times • {dist.duration} mins</p>
                            </div>
                            <button onClick={() => setDistractions(distractions.filter(d => d.id !== dist.id))} className="text-red-400">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                    ))}

                    {/* Entry Form */}
                    <div className="bg-white dark:bg-card-dark border border-charcoal/5 dark:border-white/5 rounded-xl p-4 shadow-sm">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-[10px] uppercase tracking-wider font-bold text-charcoal/40 dark:text-white/40 mb-1 block">Cause</label>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full bg-background-light dark:bg-black/20 border-none rounded-lg text-sm focus:ring-primary text-charcoal dark:text-white py-3 px-4 pr-10 font-medium text-left flex justify-between items-center transition-all hover:bg-background-light/80"
                                    >
                                        <span className="truncate">{distractionCause}</span>
                                        <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                    </button>

                                    {isDropdownOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setIsDropdownOpen(false)}
                                            ></div>
                                            <div className="absolute z-20 w-full mt-2 bg-white dark:bg-card-dark border border-charcoal/5 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                                                    {['Instagram', 'Facebook', 'YouTube', 'Family', 'Urgent Work', 'Other'].map((option) => (
                                                        <button
                                                            key={option}
                                                            onClick={() => {
                                                                setDistractionCause(option);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${distractionCause === option
                                                                ? 'bg-primary/10 text-primary'
                                                                : 'text-charcoal dark:text-white hover:bg-background-light dark:hover:bg-white/5'
                                                                }`}
                                                        >
                                                            {option}
                                                            {distractionCause === option && (
                                                                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider font-bold text-charcoal/40 dark:text-white/40 mb-1 block">Frequency (Times)</label>
                                    <input
                                        className="w-full bg-background-light dark:bg-black/20 border-none rounded-lg text-sm focus:ring-primary text-charcoal dark:text-white py-3 px-4 font-medium"
                                        type="number"
                                        value={distractionFreq}
                                        onChange={(e) => setDistractionFreq(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider font-bold text-charcoal/40 dark:text-white/40 mb-1 block">Duration (Mins)</label>
                                    <input
                                        className="w-full bg-background-light dark:bg-black/20 border-none rounded-lg text-sm focus:ring-primary text-charcoal dark:text-white py-3 px-4 font-medium"
                                        type="number"
                                        value={distractionDuration}
                                        onChange={(e) => setDistractionDuration(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={handleAddDistraction}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-center gap-2 text-primary font-bold text-sm hover:bg-primary/5 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Add Distraction Entry
                    </button>
                </div>
            </section>

            {/* Summary Section */}
            <section className="px-6 py-6 bg-primary/5 mx-6 rounded-xl mt-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-charcoal/40 dark:text-white/40 mb-1">Total Distractions</p>
                        <p className="text-xl font-bold text-charcoal dark:text-white">{distractions.length} <span className="text-xs font-normal text-charcoal/60 dark:text-white/60">entries</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-charcoal/40 dark:text-white/40 mb-1">Total Time Distracted</p>
                        <p className="text-xl font-bold text-charcoal dark:text-white">{totalDistractionTime} <span className="text-xs font-normal text-charcoal/60 dark:text-white/60">minutes</span></p>
                    </div>
                </div>
            </section>

            {/* Save Action */}
            <div className="px-6 mt-8">
                <button
                    onClick={handleSave}
                    className="w-full bg-charcoal dark:bg-white text-white dark:text-charcoal py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all"
                >
                    End Task
                </button>
            </div>
        </>
    );
}
