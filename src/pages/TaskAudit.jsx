import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import TaskEditForm from '../components/TaskEditForm';


export default function TaskAudit() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { tasks, updateTask, completeTask, saveAudit, deleteTask } = useTasks();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [scheduledStartTime, setScheduledStartTime] = useState('');
    const [scheduledEndTime, setScheduledEndTime] = useState('');
    const [priority, setPriority] = useState('high');
    const [points, setPoints] = useState(1.5);
    const [duration, setDuration] = useState('mediocre');

    const [actualStartTime, setActualStartTime] = useState('');
    const [actualEndTime, setActualEndTime] = useState('');
    // Editable State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isEditable, setIsEditable] = useState(false);
    const [changeReason, setChangeReason] = useState('');

    useEffect(() => {
        if (tasks.length > 0) {
            // Compare as strings to handle both integer and UUID IDs
            const foundTask = tasks.find(t => String(t.id) === String(taskId));
            if (foundTask) {
                setTask(foundTask);
                setTitle(foundTask.title);
                setDescription(foundTask.description);

                // Check if editable (10 mins before start)
                const now = new Date();
                let startTime = new Date();
                if (foundTask.start_time) {
                    startTime = new Date(foundTask.start_time);
                } else if (foundTask.scheduled_start_time) {
                    const [hours, minutes] = foundTask.scheduled_start_time.split(':');
                    startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                }

                const diffInMinutes = (startTime - now) / 1000 / 60;
                setIsEditable(diffInMinutes > 10);

                // Pre-fill fields if they exist
                setScheduledStartTime(foundTask.scheduled_start_time ? foundTask.scheduled_start_time.slice(0, 5) : '');
                setScheduledEndTime(foundTask.scheduled_end_time ? foundTask.scheduled_end_time.slice(0, 5) : '');
                setPriority(foundTask.priority || 'high');
                setPoints(foundTask.points || 1.5);

                // Derive duration from points
                const pts = foundTask.points || 1.5;
                if (pts === 0.5) setDuration('easy');
                else if (pts === 4) setDuration('elite');
                else setDuration('mediocre');

                setActualStartTime(foundTask.actual_start_time ? new Date(foundTask.actual_start_time).toTimeString().slice(0, 5) : '');
                // Default end time to now if not set
                setActualEndTime(foundTask.actual_end_time ? new Date(foundTask.actual_end_time).toTimeString().slice(0, 5) : '');
            }
            setLoading(false);
        }
    }, [tasks, taskId]);



    const handleUpdate = async () => {
        if (!changeReason.trim()) {
            alert("Please state a reason for the change.");
            return;
        }

        // We can log the reason or just allow the update. 
        // For now, we update the task title/description.
        // If we had an audit log for changes, we'd save it there.
        console.log("Updating Task:", { taskId, title, description, changeReason, actualStartTime, actualEndTime });

        const updates = { title, description };

        if (scheduledStartTime) {
            updates.scheduled_start_time = scheduledStartTime;
        }
        if (scheduledEndTime) {
            updates.scheduled_end_time = scheduledEndTime;
        }
        updates.priority = priority;
        updates.points = points;

        // Handle Time Updates (Merge with Date)
        if (task.actual_start_time && actualStartTime) {
            const start = new Date(task.actual_start_time);
            const [h, m] = actualStartTime.split(':').map(Number);
            start.setHours(h, m);
            updates.actual_start_time = start.toISOString();
        } else if (actualStartTime) {
            // If no previous start time, assume today
            const start = new Date();
            const [h, m] = actualStartTime.split(':').map(Number);
            start.setHours(h, m);
            updates.actual_start_time = start.toISOString();
        }

        if (task.actual_end_time && actualEndTime) {
            const end = new Date(task.actual_end_time);
            const [h, m] = actualEndTime.split(':').map(Number);
            end.setHours(h, m);
            updates.actual_end_time = end.toISOString();
        } else if (actualEndTime) {
            // If no previous end time, assume today
            const end = new Date();
            const [h, m] = actualEndTime.split(':').map(Number);
            end.setHours(h, m);
            updates.actual_end_time = end.toISOString();
        }

        console.log("FINAL Payload to Supabase:", updates); // DEBUG

        await updateTask(task.id, updates);
        navigate('/');
    };

    const handleDelete = async () => {
        if (!changeReason.trim()) {
            alert("Please state a reason for deletion.");
            return;
        }

        if (window.confirm("Are you sure you want to delete this task?")) {
            console.log("Deleting Task:", { taskId, changeReason });
            await deleteTask(task.id);
            navigate('/');
        }
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
                            <span className="material-symbols-outlined text-primary">edit_note</span>
                            Manage Task
                        </h2>
                    </div>

                    <TaskEditForm
                        title={title}
                        setTitle={setTitle}
                        description={description}
                        setDescription={setDescription}
                        isEditable={isEditable}

                        scheduledStartTime={scheduledStartTime}
                        setScheduledStartTime={setScheduledStartTime}
                        scheduledEndTime={scheduledEndTime}
                        setScheduledEndTime={setScheduledEndTime}

                        priority={priority}
                        setPriority={setPriority}
                        points={points}
                        setPoints={setPoints}
                        duration={duration}
                        setDuration={setDuration}

                        actualStartTime={actualStartTime}
                        setActualStartTime={setActualStartTime}
                        actualEndTime={actualEndTime}
                        setActualEndTime={setActualEndTime}
                    />
                </section>


                {/* Management Section */}
                <div className="px-6 mt-6 space-y-4">
                    <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-charcoal/40 dark:text-white/40 mb-1 block">State reason for change?</label>
                        <input
                            className="w-full bg-background-light dark:bg-black/20 border-none rounded-lg text-sm focus:ring-primary font-medium text-charcoal dark:text-white py-3 px-4"
                            type="text"
                            placeholder="e.g. Changed schedule, Typo fix..."
                            value={changeReason}
                            onChange={(e) => setChangeReason(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleUpdate}
                            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/30 active:scale-95 transition-transform"
                        >
                            Update Task
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex-1 bg-rose-500/10 text-rose-500 py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
                        >
                            Delete Task
                        </button>
                    </div>
                </div>

                {/* Bottom Spacer */}
                <div className="h-12"></div>
            </div>
        </div>
    );
}
