import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import TaskCompletionAudit from '../components/TaskCompletionAudit';

export default function TaskCompletionPage() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { tasks, completeTask, saveAudit } = useTasks();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    // Completion State
    const [completionStatus, setCompletionStatus] = useState(null); // 'yes', 'half', 'no'
    const [performanceReason, setPerformanceReason] = useState(null); // deep_work, distraction, not_disciplined

    // Distraction State
    const [distractions, setDistractions] = useState([]);
    const [distractionCause, setDistractionCause] = useState('Instagram');
    const [distractionFreq, setDistractionFreq] = useState(1);
    const [distractionDuration, setDistractionDuration] = useState(5);

    useEffect(() => {
        if (tasks.length > 0) {
            const foundTask = tasks.find(t => String(t.id) === String(taskId));
            if (foundTask) {
                setTask(foundTask);
            }
            setLoading(false);
        }
    }, [tasks, taskId]);

    const handleAddDistraction = () => {
        const newDistraction = {
            id: Date.now(),
            cause: distractionCause,
            frequency: distractionFreq,
            duration: distractionDuration
        };
        setDistractions([...distractions, newDistraction]);
    };

    const handleSave = async () => {
        if (!completionStatus) {
            alert("Please select a completion status.");
            return;
        }

        const auditData = {
            taskId: task.id,
            completionStatus,
            performanceReason,
            distractions,
            durationMinutes: task.actual_start_time
                ? Math.round((new Date() - new Date(task.actual_start_time)) / 60000)
                : 0
        };

        try {
            // 1. Save Audit Log
            await saveAudit(auditData);

            // 2. Mark Task as Completed
            await completeTask(task.id);

            navigate('/');
        } catch (error) {
            console.error("Error saving audit:", error);
            alert("Failed to save audit. Please try again.");
        }
    };

    // Extra Time Calculation
    const [extraTime, setExtraTime] = useState("None");
    const [isOverdue, setIsOverdue] = useState(false);

    useEffect(() => {
        if (!task) return;

        const calculateExtraTime = () => {
            if (!task.scheduled_end_time) return;

            const now = new Date();
            const [h, m] = task.scheduled_end_time.split(':').map(Number);
            const scheduledEnd = new Date();
            scheduledEnd.setHours(h, m, 0, 0);

            const diff = now - scheduledEnd;
            const threeHoursMs = 3 * 60 * 60 * 1000;

            if (diff > threeHoursMs) {
                setIsOverdue(true);
                setExtraTime("More than 3 hours late");
            } else if (diff > 0) {
                setIsOverdue(true);
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setExtraTime(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            } else {
                setIsOverdue(false);
                setExtraTime("None");
            }
        };

        const interval = setInterval(calculateExtraTime, 1000);
        calculateExtraTime(); // Initial call

        return () => clearInterval(interval);
    }, [task]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-400">
                <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            </div>
        );
    }

    if (!task) return <div className="p-6">Task not found</div>;

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-charcoal dark:text-white flex flex-col items-center">
            <div className="w-full max-w-md bg-background-light dark:bg-background-dark min-h-screen flex flex-col pb-32">

                {/* Header */}
                <section className="p-6 pb-2 bg-white dark:bg-card-dark border-b border-charcoal/5 dark:border-white/5">
                    <div className="flex justify-between items-start mb-4">
                        <button onClick={() => navigate('/')} className="mb-4">
                            <span className="material-symbols-outlined text-charcoal dark:text-white">arrow_back</span>
                        </button>
                        <h2 className="text-lg font-bold text-charcoal dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">check_circle</span>
                            Complete Task
                        </h2>
                    </div>
                </section>

                <TaskCompletionAudit
                    completionStatus={completionStatus}
                    setCompletionStatus={setCompletionStatus}
                    performanceReason={performanceReason}
                    setPerformanceReason={setPerformanceReason}
                    distractions={distractions}
                    setDistractions={setDistractions}
                    handleAddDistraction={handleAddDistraction}
                    handleSave={handleSave}
                    distractionCause={distractionCause}
                    setDistractionCause={setDistractionCause}
                    distractionFreq={distractionFreq}
                    setDistractionFreq={setDistractionFreq}
                    distractionDuration={distractionDuration}
                    setDistractionDuration={setDistractionDuration}
                    extraTime={extraTime}
                    isOverdue={isOverdue}
                />
            </div>
            );</div>
    );
}
