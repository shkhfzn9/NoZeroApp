import React, { useState } from 'react';
import clsx from 'clsx';

export default function TaskEditForm({
    title,
    setTitle,
    description,
    setDescription,
    isEditable,
    scheduledStartTime,
    setScheduledStartTime,
    scheduledEndTime,
    setScheduledEndTime,
    priority,
    setPriority,
    points,
    setPoints,
    duration,
    setDuration,
    actualStartTime,
    setActualStartTime,
    actualEndTime,
    setActualEndTime
}) {
    const [isDurationOpen, setIsDurationOpen] = useState(false);

    // Helpers from AddTaskModal
    const calculatePoints = (d) => {
        switch (d) {
            case 'easy': return 0.5;
            case 'mediocre': return 1.5;
            case 'elite': return 4;
            default: return 1.5;
        }
    };

    const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const minutesToTime = (totalMinutes) => {
        let h = Math.floor(totalMinutes / 60) % 24;
        let m = totalMinutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const getMinDuration = (d) => {
        if (d === 'mediocre') return 20;
        if (d === 'elite') return 60;
        return 0; // easy
    };

    const getMaxDuration = (d) => {
        if (d === 'easy') return 19;
        if (d === 'mediocre') return 59;
        return null; // elite
    };

    const validateEndTime = (start, end, durationType) => {
        const minDuration = getMinDuration(durationType);
        const maxDuration = getMaxDuration(durationType);

        let startMins = timeToMinutes(start);
        let endMins = timeToMinutes(end);

        if (endMins < startMins) endMins += 24 * 60;

        const currentDuration = endMins - startMins;

        if (currentDuration < minDuration) {
            return minutesToTime(startMins + minDuration);
        }

        if (maxDuration !== null && currentDuration > maxDuration) {
            return minutesToTime(startMins + maxDuration);
        }

        return end;
    };

    const handleDurationChange = (newDuration) => {
        const newEndTime = validateEndTime(scheduledStartTime, scheduledEndTime, newDuration);
        setDuration(newDuration);
        setPoints(calculatePoints(newDuration));
        setScheduledEndTime(newEndTime);
        setIsDurationOpen(false);
    };

    const handleStartTimeChange = (e) => {
        const newStart = e.target.value;
        setScheduledStartTime(newStart);
        // Auto-adjust end time logic if needed, or just validate
        const newEndTime = validateEndTime(newStart, scheduledEndTime, duration);
        setScheduledEndTime(newEndTime);
    };

    const handleEndTimeChange = (e) => {
        const newEnd = e.target.value;
        const validatedEnd = validateEndTime(scheduledStartTime, newEnd, duration);
        setScheduledEndTime(validatedEnd);
    };

    return (
        <div className="space-y-6">
            {/* Task Identification */}
            <section className="space-y-4 bg-white dark:bg-card-dark p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="group">
                    <label className="block text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider mb-2 px-1">Task Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        readOnly={!isEditable}
                        className={clsx(
                            "w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border-none rounded-[20px] text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-primary/40 outline-none transition-all",
                            !isEditable && "opacity-70"
                        )}
                        placeholder="e.g. Practice DSA"
                    />
                </div>
                <div className="group">
                    <label className="block text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider mb-2 px-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        readOnly={!isEditable}
                        className={clsx(
                            "w-full bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/5 border rounded-xl p-4 text-charcoal dark:text-white placeholder:text-charcoal/30 focus:ring-2 focus:ring-primary/40 outline-none transition-all resize-none",
                            !isEditable && "opacity-70"
                        )}
                        rows="3"
                    ></textarea>
                </div>
            </section>

            {/* Classification & Priority */}
            <section className="space-y-4 bg-white dark:bg-card-dark p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                <div>
                    <label className="block text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider mb-3 px-1">Priority Level</label>
                    <div className="flex p-1 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/5">
                        {['high', 'medium', 'low'].map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => isEditable && setPriority(p)}
                                disabled={!isEditable}
                                className={clsx(
                                    "flex-1 text-center py-2.5 rounded-lg text-sm font-semibold transition-all capitalize",
                                    priority === p ? "bg-charcoal dark:bg-primary text-white shadow-sm" : "text-charcoal/70 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5",
                                    !isEditable && "cursor-not-allowed opacity-70"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Duration & Timing */}
            <section className="grid grid-cols-1 gap-4 bg-white dark:bg-card-dark p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                <div>
                    <label className="block text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider mb-2 px-1">Estimated Duration</label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => isEditable && setIsDurationOpen(!isDurationOpen)}
                            disabled={!isEditable}
                            className={clsx(
                                "w-full h-14 bg-gray-50 dark:bg-black/20 border rounded-xl px-4 flex items-center justify-between outline-none transition-all",
                                isDurationOpen ? "ring-2 ring-primary/40 border-primary" : "border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5",
                                !isEditable && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            <span className="text-sm font-medium text-charcoal dark:text-white">
                                {duration === 'easy' && "0-20 min (Easy) - 0.5 Pts"}
                                {duration === 'mediocre' && "20 min - 1 hr (Mediocre) - 1.5 Pts"}
                                {duration === 'elite' && "1 hr+ (Elite) - 4 Pts"}
                            </span>
                            <span className="material-symbols-outlined text-charcoal/40 dark:text-white/40">expand_more</span>
                        </button>

                        {isDurationOpen && (
                            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-card-dark border border-gray-100 dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
                                {[
                                    { value: 'easy', label: '0-20 min (Easy) - 0.5 Pts', color: 'bg-emerald-500' },
                                    { value: 'mediocre', label: '20 min - 1 hr (Mediocre) - 1.5 Pts', color: 'bg-amber-500' },
                                    { value: 'elite', label: '1 hr+ (Elite) - 4 Pts', color: 'bg-rose-500' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleDurationChange(option.value)}
                                        className={clsx(
                                            "w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3",
                                            duration === option.value ? "text-primary bg-gray-50/80 dark:bg-white/5" : "text-charcoal dark:text-white"
                                        )}
                                    >
                                        <span className={clsx("w-2 h-2 rounded-full", option.color)}></span>
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider mb-2 px-1">Scheduled Start</label>
                        <input
                            type="time"
                            value={scheduledStartTime}
                            onChange={handleStartTimeChange}
                            readOnly={!isEditable}
                            className={clsx(
                                "w-full h-14 bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/5 border rounded-xl px-3 text-sm text-charcoal dark:text-white focus:ring-2 focus:ring-primary/40 outline-none",
                                !isEditable && "opacity-70"
                            )}
                            style={{ colorScheme: 'light dark' }}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider mb-2 px-1">Scheduled End</label>
                        <input
                            type="time"
                            value={scheduledEndTime}
                            onChange={handleEndTimeChange}
                            readOnly={!isEditable}
                            className={clsx(
                                "w-full h-14 bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/5 border rounded-xl px-3 text-sm text-charcoal dark:text-white focus:ring-2 focus:ring-primary/40 outline-none",
                                !isEditable && "opacity-70"
                            )}
                            style={{ colorScheme: 'light dark' }}
                        />
                    </div>
                </div>
            </section>



            <div className={`flex items-center gap-2 text-[10px] font-medium ${isEditable ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                <span className="material-symbols-outlined text-xs">{isEditable ? 'lock_open' : 'lock'}</span>
                Plan edits locked 10 mins before start time
            </div>
        </div>
    );
}

