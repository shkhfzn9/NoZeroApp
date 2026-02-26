import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import clsx from 'clsx';

export default function AddTaskModal() {
    const navigate = useNavigate();
    const { addTask, user, loading } = useTasks();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // Helper to get current time string "HH:MM"
    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    };

    const getEndTime = () => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    };

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'high', // Default
        duration: 'mediocre', // Default: 30 min - 1 hr
        scheduled_start_time: getCurrentTime(),
        scheduled_end_time: getEndTime(),
        points: 1.5 // Calculated from duration
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isDurationOpen, setIsDurationOpen] = useState(false);

    // Logic to calculate points based on duration
    const calculatePoints = (duration) => {
        switch (duration) {
            case 'easy': return 0.5;
            case 'mediocre': return 1.5;
            case 'elite': return 4;
            default: return 1.5;
        }
    };

    // Helper to convert HH:MM to minutes
    const timeToMinutes = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    // Helper to convert minutes back to HH:MM
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
        return null; // elite (unlimited)
    };

    const validateEndTime = (start, end, durationType) => {
        const minDuration = getMinDuration(durationType);
        const maxDuration = getMaxDuration(durationType);

        let startMins = timeToMinutes(start);
        let endMins = timeToMinutes(end);

        // Handle next day wrap
        if (endMins < startMins) endMins += 24 * 60;

        const currentDuration = endMins - startMins;

        // Enforce Minimum Duration
        if (currentDuration < minDuration) {
            return minutesToTime(startMins + minDuration);
        }

        // Enforce Maximum Duration (Prevent "overboard")
        if (maxDuration !== null && currentDuration > maxDuration) {
            return minutesToTime(startMins + maxDuration);
        }

        return end;
    };

    const handleDurationChange = (e) => {
        const newDuration = e.target.value;
        const newEndTime = validateEndTime(formData.scheduled_start_time, formData.scheduled_end_time, newDuration);

        setFormData(prev => ({
            ...prev,
            duration: newDuration,
            points: calculatePoints(newDuration),
            scheduled_end_time: newEndTime
        }));
    };

    const handleStartTimeChange = (e) => {
        const newStart = e.target.value;
        // When start changes, we want to maintain the specific duration gap if possible, OR just validate min duration?
        // User asked: "Auto-adjust End Time on Duration/Start Time change"
        // Let's validate. If current gap is too small, push end time.
        const newEndTime = validateEndTime(newStart, formData.scheduled_end_time, formData.duration);

        setFormData(prev => ({
            ...prev,
            scheduled_start_time: newStart,
            scheduled_end_time: newEndTime
        }));
    };

    const handleEndTimeChange = (e) => {
        const newEnd = e.target.value;
        // If user tries to pick invalid end time, snap it back or ignore
        const validatedEnd = validateEndTime(formData.scheduled_start_time, newEnd, formData.duration);

        setFormData(prev => ({
            ...prev,
            scheduled_end_time: validatedEnd
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("[AddTaskModal] handleSubmit triggered.");
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError('');

        try {
            // Prepare payload - mapping local state to backend needs
            // Note: We are abstracting 'priority' and 'duration' into the task data if needed, 
            // but for now relying on standard fields. We could store priority in description or similar if backend doesn't support it,
            // but the prompt implies visual redesign primary.
            const taskPayload = {
                title: formData.title,
                description: formData.description,
                scheduled_start_time: formData.scheduled_start_time,
                scheduled_end_time: formData.scheduled_end_time,
                priority: formData.priority,
                points: formData.points
            };

            const result = await addTask(taskPayload);

            if (result) {
                navigate('/');
            } else {
                setError("Task creation failed. Please check your connection and try again.");
            }
        } catch (error) {
            console.error("[AddTaskModal] Unexpected error:", error);
            setError("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#F9FAFB] dark:bg-background-dark font-sans text-charcoal">
            {/* Top Navigation Bar - Matching Reference Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-charcoal">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold tracking-tight text-charcoal uppercase">Commit New Task</h1>
                </div>
                <button onClick={() => navigate(-1)} className="text-xs font-semibold text-charcoal/50 hover:text-charcoal uppercase tracking-widest">Cancel</button>
            </header>

            <main className="flex-1 overflow-y-auto w-full max-w-lg mx-auto pt-20 pb-32 px-4 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-600">
                        <span className="material-symbols-outlined text-base">error</span>
                        <p className="text-xs font-bold">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Task Identification */}
                    <section className="space-y-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="group">
                            <label className="block text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-2 px-1">Task Title</label>
                            <p className="text-[11px] text-charcoal/40 mb-3 px-1">Enter a concise and actionable name for your task.</p>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-zinc-800 border-none rounded-[20px] text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-accent-lavender/40 focus:border-accent-lavender outline-none transition-all"
                                placeholder="e.g. Practice DSA – Stacks & Queues"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-2 px-1">Description</label>
                            <p className="text-[11px] text-charcoal/40 mb-3 px-1">Add specific details or sub-steps to define success.</p>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-gray-50 border-gray-200 border rounded-xl p-4 text-charcoal placeholder:text-charcoal/30 focus:ring-2 focus:ring-lavender/40 focus:border-lavender outline-none transition-all resize-none"
                                placeholder="Solve 5 medium problems and revise notes."
                                rows="4"
                            ></textarea>
                        </div>
                    </section>

                    {/* Classification & Priority */}
                    <section className="space-y-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div>
                            <label className="block text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-3 px-1">Priority Level</label>
                            <p className="text-[11px] text-charcoal/40 mb-3 px-1">Higher priority tasks yield better daily rewards.</p>
                            <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-200">
                                {['high', 'medium', 'low'].map((p) => (
                                    <label key={p} className={clsx(
                                        "flex-1 text-center py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all capitalize",
                                        formData.priority === p ? "bg-charcoal text-white shadow-sm" : "text-charcoal/70 hover:bg-gray-100"
                                    )}>
                                        <input
                                            type="radio"
                                            name="priority"
                                            value={p}
                                            checked={formData.priority === p}
                                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                            className="hidden"
                                        />
                                        {p}
                                    </label>
                                ))}
                            </div>
                            <p className="mt-3 text-[11px] leading-relaxed text-charcoal/50 px-1 italic">Higher priority is a personal choice and does not impact system rewards.</p>
                        </div>
                    </section>

                    {/* Duration & Timing */}
                    <section className="grid grid-cols-1 gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div>
                            <label className="block text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-2 px-1">Estimated Duration</label>
                            <div className="relative" ref={node => {
                                // Simple click outside handler could be added here or via a hook if needed
                                // For now, the blur or click masking is sufficient
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setIsDurationOpen(!isDurationOpen)}
                                    className={clsx(
                                        "w-full h-14 bg-gray-50 border rounded-xl px-4 flex items-center justify-between outline-none transition-all",
                                        isDurationOpen ? "ring-2 ring-accent-lavender/40 border-accent-lavender" : "border-gray-200 hover:bg-gray-100"
                                    )}
                                >
                                    <span className="text-sm font-medium text-charcoal">
                                        {formData.duration === 'easy' && "0-20 min (Easy) - 0.5 Pts"}
                                        {formData.duration === 'mediocre' && "20 min - 1 hr (Mediocre) - 1.5 Pts"}
                                        {formData.duration === 'elite' && "1 hr+ (Elite) - 4 Pts"}
                                    </span>
                                    <span className={clsx("material-symbols-outlined text-charcoal/40 transition-transform duration-200", isDurationOpen && "rotate-180")}>expand_more</span>
                                </button>

                                {isDurationOpen && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                        {[
                                            { value: 'easy', label: '0-20 min (Easy) - 0.5 Pts', color: 'bg-emerald-500' },
                                            { value: 'mediocre', label: '20 min - 1 hr (Mediocre) - 1.5 Pts', color: 'bg-amber-500' },
                                            { value: 'elite', label: '1 hr+ (Elite) - 4 Pts', color: 'bg-rose-500' }
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => {
                                                    const e = { target: { value: option.value } };
                                                    handleDurationChange(e);
                                                    setIsDurationOpen(false);
                                                }}
                                                className={clsx(
                                                    "w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50 flex items-center gap-3",
                                                    formData.duration === option.value ? "text-accent-lavender bg-gray-50/80" : "text-charcoal"
                                                )}
                                            >
                                                <span className={clsx("w-2 h-2 rounded-full", option.color)}></span>
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <p className="text-[11px] text-charcoal/40 my-4 px-1 leading-relaxed">Task duration yields your daily reward for consistency score. To maintain your consistency score and daily streak, the system requires: 2 Elite, 1 Mediocre, and 1 Easy task durations.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-2 px-1">Start Time</label>
                                <p className="text-[11px] text-charcoal/40 mb-3 px-1">Set an expected start time</p>
                                <input
                                    required
                                    type="time"
                                    value={formData.scheduled_start_time}
                                    onChange={handleStartTimeChange}
                                    className="w-full h-14 bg-gray-50 border-gray-200 border rounded-xl px-3 text-sm text-charcoal focus:ring-2 focus:ring-accent-lavender/40 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-2 px-1">End Time</label>
                                <p className="text-[11px] text-charcoal/40 mb-3 px-1">Set an expected finish time.</p>
                                <input
                                    required
                                    type="time"
                                    value={formData.scheduled_end_time}
                                    onChange={handleEndTimeChange}
                                    className="w-full h-14 bg-gray-50 border-gray-200 border rounded-xl px-3 text-sm text-charcoal focus:ring-2 focus:ring-accent-lavender/40 outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Checkbox */}
                    <section className="pt-4 border-t border-gray-200">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="mt-0.5">
                                <input type="checkbox" className="w-5 h-5 rounded border-gray-200 text-accent-lime focus:ring-accent-lime transition-all cursor-pointer" />
                            </div>
                            <span className="text-sm text-charcoal/70 leading-relaxed font-medium group-hover:text-charcoal transition-colors">
                                I understand this task will lock 5 minutes before start time.
                            </span>
                        </label>
                    </section>

                    {/* Fixed Action Button Footer (in flow for mobile, or fixed if desired, here keeping relative for flow) */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-accent-lime hover:bg-[#72b013] active:scale-[0.98] text-charcoal py-4 rounded-xl font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 uppercase tracking-tight disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {isSubmitting ? 'Committing...' : 'Commit Task'}
                            {!isSubmitting && <span className="material-symbols-outlined text-xl">assignment_turned_in</span>}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
