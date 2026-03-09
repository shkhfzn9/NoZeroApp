import React from 'react';
import { useTasks } from '../hooks/useTasks';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import FeatureTour from '../components/FeatureTour';
import FirstTaskPopup from '../components/FirstTaskPopup';

const TOUR_STEPS = [
    {
        target: 'add-task-btn',
        icon: 'add_circle',
        iconBg: 'bg-primary/20',
        iconColor: 'text-primary',
        tag: 'Step 1 of 5',
        title: 'Schedule Your First Task',
        body: 'Tap this + button to add a task. Set a title, time slot, points value, and priority. Every task you complete earns points.',
    },
    {
        target: 'score-card',
        icon: 'analytics',
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-400',
        tag: 'Step 2 of 5',
        title: 'Your Consistency Score',
        body: 'This card tracks your overall score and daily streak. Hit 10 points today to extend your streak. Tap VIEW REPORT for deeper analytics.',
    },
    {
        target: 'tabs-bar',
        icon: 'tab',
        iconBg: 'bg-violet-500/20',
        iconColor: 'text-violet-400',
        tag: 'Step 3 of 5',
        title: 'Switch Your Task View',
        body: 'Use these tabs to switch between Today\'s tasks, Completed tasks, Missed tasks, and your full History.',
    },
    {
        target: 'task-card-area',
        icon: 'task_alt',
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-400',
        tag: 'Step 4 of 5',
        title: 'Start & Complete Tasks',
        body: 'Each card has a Start and End button. Start unlocks 5 min before scheduled time, End unlocks near the scheduled end. Tap a card to view your audit.',
    },
    {
        target: 'bottom-nav',
        icon: 'navigation',
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-400',
        tag: 'Step 5 of 5',
        title: 'Navigate the App',
        body: 'Use the nav bar to visit Friends (accountability partners), the Leaderboard (where do you rank?), and your Profile (your public audit record).',
    },
];


// Timer Component (Moved outside)
const TaskTimer = ({ startTime, endTime, scheduledEndTime }) => {
    const [duration, setDuration] = React.useState("00:00:00");
    const [isOverdue, setIsOverdue] = React.useState(false);

    React.useEffect(() => {
        if (!startTime) return;

        const calculateDuration = () => {
            const now = new Date();
            const start = new Date(startTime).getTime();
            let effectiveEnd = endTime ? new Date(endTime).getTime() : now.getTime(); // Initialize effectiveEnd

            // Check if overdue and apply capping logic
            if (scheduledEndTime && !endTime) {
                // Parse scheduled end time (assuming HH:MM format and today's date)
                const [h, m] = scheduledEndTime.split(':').map(Number);
                const scheduledEnd = new Date();
                scheduledEnd.setHours(h, m, 0, 0);
                const threeHoursMs = 3 * 60 * 60 * 1000;

                if (now > scheduledEnd) {
                    setIsOverdue(true);

                    // If more than 3 hours overdue, cap the 'end' time for calculation
                    if (now.getTime() - scheduledEnd.getTime() > threeHoursMs) {
                        // Cap duration at Scheduled End + 3 hours
                        const cappedEnd = scheduledEnd.getTime() + threeHoursMs;
                        // If the current 'now' is beyond the capped end, use the capped end
                        if (effectiveEnd > cappedEnd) {
                            effectiveEnd = cappedEnd;
                        }
                    }
                } else {
                    setIsOverdue(false);
                }
            }

            const diff = effectiveEnd - start;

            if (diff < 0) {
                setDuration("00:00:00");
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setDuration(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        // Initial calculation
        calculateDuration();

        // Only set interval if there is no end time (running task)
        let interval;
        if (!endTime) {
            interval = setInterval(calculateDuration, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [startTime, endTime, scheduledEndTime]);

    return (
        <span className={clsx(isOverdue ? "text-red-500 transition-colors duration-500" : "")}>
            {duration}
        </span>
    );
};

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        user, tasks, startTask, completeTask, loading, isDayOff, dayOffsThisWeek,
        friends, acceptFriendRequest, rejectFriendRequest
    } = useTasks();
    const [activeTab, setActiveTab] = React.useState('today');
    // History filters
    const [historyDate, setHistoryDate] = React.useState('');
    const [historyStatus, setHistoryStatus] = React.useState('all');
    const [expandedHistoryId, setExpandedHistoryId] = React.useState(null);
    // Add real-time clock to trigger re-renders for End button lock logic
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const [confirmTaskId, setConfirmTaskId] = React.useState(null);
    const [hasStartedJourney, setHasStartedJourney] = React.useState(
        localStorage.getItem('nozero_journey_started') === 'true'
    );
    const [showBrutalStartModal, setShowBrutalStartModal] = React.useState(false);
    const [showNotifications, setShowNotifications] = React.useState(false);

    // First Task Popup logic
    const [showFirstTaskPopup, setShowFirstTaskPopup] = React.useState(
        location.state?.showFirstTaskPopup || false
    );

    // Clear the location state so refresh doesn't trigger it again
    React.useEffect(() => {
        if (location.state?.showFirstTaskPopup) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    // Derived state for notifications
    const pendingRequests = friends ? friends.filter(f => f.status === 'pending' && !f.isSender) : [];
    const unreadCount = pendingRequests.length;

    // Auto-start if they already have tasks
    React.useEffect(() => {
        if (tasks.length > 0 && !hasStartedJourney) {
            localStorage.setItem('nozero_journey_started', 'true');
            setHasStartedJourney(true);
        }
    }, [tasks, hasStartedJourney]);

    const todayStr = new Date().toLocaleDateString('en-CA');
    const todayIsOff = isDayOff ? isDayOff(todayStr) : false;
    const weekLimitReached = dayOffsThisWeek ? dayOffsThisWeek() >= 2 : false;

    // Feature tour — show once for first-time users
    const [showTour, setShowTour] = React.useState(false);
    React.useEffect(() => {
        if (user && !localStorage.getItem('nozero_tour_done')) {
            // Small delay so DOM is painted
            const t = setTimeout(() => setShowTour(true), 800);
            return () => clearTimeout(t);
        }
    }, [user]);
    const handleTourDone = () => {
        localStorage.setItem('nozero_tour_done', '1');
        setShowTour(false);
    };

    React.useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Filter tasks based on active tab
    const filteredTasks = React.useMemo(() => {
        const now = new Date();
        const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD

        const getTaskDate = (task) => {
            return new Date(task.created_at).toLocaleDateString('en-CA');
        };

        if (activeTab === 'today') {
            // Show ALL tasks created today (Scheduled, Completed, Missed, etc.)
            return tasks.filter(t => getTaskDate(t) === todayStr);
        } else if (activeTab === 'completed') {
            // Only today's completed tasks
            return tasks.filter(t => t.status === 'completed' && getTaskDate(t) === todayStr);
        } else if (activeTab === 'missed') {
            // Only today's missed tasks
            return tasks.filter(t => t.status === 'missed' && getTaskDate(t) === todayStr);
        } else {
            // History: All tasks from previous days + advanced filters
            let historyTasks = tasks.filter(t => getTaskDate(t) < todayStr);

            // Apply date filter
            if (historyDate) {
                historyTasks = historyTasks.filter(t => getTaskDate(t) === historyDate);
            }

            // Apply status filter
            if (historyStatus !== 'all') {
                historyTasks = historyTasks.filter(t => t.status === historyStatus);
            }

            // Sort newest first
            return historyTasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    }, [tasks, activeTab, historyDate, historyStatus]);

    // Counts scoped to today (reuses todayStr from line 177)
    const todayCompletedCount = tasks.filter(t => t.status === 'completed' && new Date(t.created_at).toLocaleDateString('en-CA') === todayStr).length;
    const todayMissedCount = tasks.filter(t => t.status === 'missed' && new Date(t.created_at).toLocaleDateString('en-CA') === todayStr).length;

    console.log(`[Dashboard] Render. Loading=${loading}, User=${user?.id}`);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-400">
                <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirect users who haven't completed the onboarding pledge yet
    if (user.onboarding_complete === false) {
        return <Navigate to="/onboarding" replace />;
    }

    // Helper to determine card theme
    const getCardTheme = (index, status) => {
        if (status === 'missed') {
            return {
                container: "bg-white dark:bg-charcoal border-2 border-rose-500/30 text-charcoal dark:text-white",
                tagColor: "text-rose-500",
                buttonBg: "bg-gray-100 dark:bg-zinc-800",
                buttonIconColor: "text-charcoal dark:text-white",
                timerBg: "bg-gray-50 dark:bg-zinc-800/50",
                actionBtnStart: "bg-gray-200 dark:bg-zinc-700 text-gray-500 cursor-not-allowed",
                actionBtnEnd: "bg-gray-200 dark:bg-zinc-700 text-gray-500 cursor-not-allowed",
                timerText: "text-gray-400",
                divider: "border-gray-100 dark:border-zinc-800",
                bottomTab: "bg-white dark:bg-charcoal border-b-2 border-l-2 border-r-2 border-rose-500/30",
                statusBadge: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
                icon: "north_east"
            };
        }

        const themes = [
            { // Primary (Lime)
                container: "bg-primary text-charcoal shadow-xl shadow-primary/10",
                tagColor: "opacity-60",
                buttonBg: "bg-charcoal",
                buttonIconColor: "text-white",
                timerBg: "bg-charcoal/5",
                actionBtnStart: "bg-charcoal text-white",
                actionBtnEnd: "bg-charcoal/10 text-charcoal",
                timerText: "text-charcoal",
                divider: "border-charcoal/10",
                bottomTab: "bg-primary",
                statusBadge: "bg-charcoal/10",
                icon: "north_east"
            },
            { // Lavender
                container: "bg-lavender text-charcoal",
                tagColor: "opacity-60",
                buttonBg: "bg-white",
                buttonIconColor: "text-charcoal",
                timerBg: "bg-white/30",
                actionBtnStart: "bg-charcoal text-white",
                actionBtnEnd: "bg-white/40 text-charcoal",
                timerText: "text-charcoal",
                divider: "border-charcoal/10",
                bottomTab: "bg-lavender",
                statusBadge: "bg-white/40",
                icon: "north_east"
            }
        ];
        return themes[index % 2];
    };



    const handleStartClick = (e, taskId) => {
        e.stopPropagation();
        setConfirmTaskId(taskId);
    };

    const confirmStart = () => {
        if (confirmTaskId) {
            startTask(confirmTaskId);
            setConfirmTaskId(null);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-charcoal dark:text-white min-h-screen flex justify-center items-start font-sans">
            <div className="w-full min-h-screen bg-background-light dark:bg-background-dark relative pb-32">

                {/* Header */}
                <header className="flex justify-between items-center px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <Link to="/profile" className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-white dark:border-charcoal shadow-sm">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAL8pvrB1GASpw55GkdYt1zeZpkeZQJDatNAKib_EKTI8ay70yAZ3Hy8FZEOgLmf68Cu8yKP9kovDG1RaRCi2XEZBz-AZ0tY2kzmtCEJmbg220WE4PgAHpDYDz1e94RiH4PMumG4DhRerwl7x7OUPjGEg95L0uqNcCL-RqQJvJGrvjaRjcVdllppZyGVlNQs__HjZK-jB3rwv4Y-4DOd0Bnj62fn2cNCUJtG6SulhojD4cd6DVzb-iEs8kGzYaXC0e1HyIPixKJKjw" alt="Profile" className="w-full h-full object-cover" />
                            )}
                        </Link>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Discipline Audit</p>
                            <h1 className="text-xl font-extrabold tracking-tight">NoZero</h1>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button data-tour="add-task-btn" onClick={() => navigate('/add-task')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-charcoal shadow-sm">
                            <span className="material-icons-outlined text-[20px]">add</span>
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-lavender/20 dark:bg-lavender/10 relative"
                            >
                                <span className="material-icons-outlined text-lavender text-[20px]">notifications</span>
                                {unreadCount > 0 && (
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background-light dark:border-background-dark"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowNotifications(false)}
                                    ></div>
                                    <div className="absolute top-14 right-0 w-80 bg-white dark:bg-zinc-900 rounded-[24px] shadow-2xl border border-slate-100 dark:border-white/10 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
                                            <h3 className="font-bold text-sm tracking-widest uppercase text-slate-400">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="bg-primary text-charcoal text-[10px] font-black px-2 py-0.5 rounded-full">
                                                    {unreadCount} NEW
                                                </span>
                                            )}
                                        </div>

                                        <div className="max-h-96 overflow-y-auto no-scrollbar">
                                            {pendingRequests.length > 0 ? (
                                                pendingRequests.map(req => (
                                                    <div key={req.id} className="p-4 border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 overflow-hidden shrink-0 mt-1">
                                                                {req.friend?.avatar_url ? (
                                                                    <img src={req.friend.avatar_url} alt={req.friend.username} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-black">
                                                                        {req.friend?.username?.[0]?.toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm text-charcoal dark:text-gray-300">
                                                                    <strong className="dark:text-white">{req.friend?.username}</strong> wants to add you to their network.
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                                                                    Score: {req.friend?.consistency_score || 0}
                                                                </p>
                                                                <div className="flex gap-2 mt-3">
                                                                    <button
                                                                        onClick={() => acceptFriendRequest(req.id)}
                                                                        className="flex-1 py-1.5 bg-primary text-charcoal text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                                                                    >
                                                                        Accept
                                                                    </button>
                                                                    <button
                                                                        onClick={() => rejectFriendRequest(req.id)}
                                                                        className="flex-1 py-1.5 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                                                                    >
                                                                        Ignore
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-8 text-center px-4">
                                                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">notifications_off</span>
                                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">You're all caught up</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No new notifications.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Consistency Score Card */}
                <section data-tour="score-card" className="px-6 mb-8">
                    <div className="bg-charcoal dark:bg-zinc-900 rounded-[32px] p-6 text-white relative overflow-hidden group">
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Consistency Score</p>
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-5xl font-extrabold text-primary">{user?.consistency_score ?? 0}</span>
                                    <span className="text-xl font-bold text-primary/80">Pts</span>
                                </div>
                                {/* Today's Points Indicator */}
                                {(() => {
                                    const todayStr = new Date().toLocaleDateString('en-CA');
                                    const todayPoints = tasks
                                        ?.filter(t => t.status === 'completed' && t.actual_end_time?.startsWith(todayStr))
                                        .reduce((sum, t) => sum + (t.points || 0), 0) || 0;

                                    return (
                                        <div className="mt-2 flex items-center gap-1.5">
                                            <div className={clsx(
                                                "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md",
                                                todayPoints >= 10 ? "bg-primary text-charcoal" : "bg-white/10 text-white"
                                            )}>
                                                +{todayPoints} pts today
                                            </div>
                                            {todayPoints < 10 && (
                                                <span className="text-[10px] text-white/50 font-medium">
                                                    (Need {10 - todayPoints} more for streak)
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                            <div className="bg-white/10 px-3 py-2 rounded-2xl backdrop-blur-sm flex items-center gap-2">
                                <span className="material-icons-outlined text-orange-500 text-lg">local_fire_department</span>
                                <div>
                                    <span className="text-xs text-white/60 font-bold uppercase block leading-none">Streak</span>
                                    <span className="text-sm font-extrabold text-white leading-none">{user?.current_streak ?? 0} Day</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex items-center justify-between relative z-10">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full border-2 border-charcoal bg-gray-300"></div>
                                <div className="w-8 h-8 rounded-full border-2 border-charcoal bg-gray-400"></div>
                                <div className="w-8 h-8 rounded-full border-2 border-charcoal bg-gray-500 flex items-center justify-center text-[10px] font-bold">+12</div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!todayIsOff && (
                                    <button
                                        onClick={() => navigate('/day-off')}
                                        disabled={weekLimitReached}
                                        className={`px-3 py-2 rounded-full text-xs font-bold flex items-center space-x-1 transition-opacity ${weekLimitReached
                                            ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                            : 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30'
                                            }`}
                                        title={weekLimitReached ? 'Day-off limit reached (2/week)' : 'Take a day off today'}
                                    >
                                        <span>🌿</span>
                                        <span>{weekLimitReached ? 'Limit Reached' : 'Day Off'}</span>
                                    </button>
                                )}
                                <button onClick={() => navigate('/report')} className="bg-primary text-charcoal px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-1 hover:scale-105 transition-transform">
                                    <span>VIEW REPORT</span>
                                    <span className="material-symbols-outlined text-sm">analytics</span>
                                </button>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
                    </div>
                </section>

                {/* Tabs */}
                <div data-tour="tabs-bar" className="flex space-x-2 px-6 mb-6 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('today')}
                        className={clsx(
                            "px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
                            activeTab === 'today' ? "bg-charcoal dark:bg-white text-white dark:text-charcoal" : "bg-white dark:bg-charcoal text-gray-500"
                        )}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={clsx(
                            "px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
                            activeTab === 'completed' ? "bg-charcoal dark:bg-white text-white dark:text-charcoal" : "bg-white dark:bg-charcoal text-gray-500"
                        )}
                    >
                        Completed <span className="ml-1 px-1.5 py-0.5 bg-primary text-charcoal rounded text-[10px]">{todayCompletedCount}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('missed')}
                        className={clsx(
                            "px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
                            activeTab === 'missed' ? "bg-charcoal dark:bg-white text-white dark:text-charcoal" : "bg-white dark:bg-charcoal text-gray-500"
                        )}
                    >
                        Missed <span className="ml-1 px-1.5 py-0.5 bg-rose-500/10 text-rose-500 rounded text-[10px]">{todayMissedCount}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={clsx(
                            "px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
                            activeTab === 'history' ? "bg-charcoal dark:bg-white text-white dark:text-charcoal" : "bg-white dark:bg-charcoal text-gray-500"
                        )}
                    >
                        History
                    </button>
                </div>

                {/* Day Off Active Banner */}
                {todayIsOff && (
                    <div className="mx-6 mb-4 flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl px-4 py-3">
                        <span className="text-xl">🌿</span>
                        <div>
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">You're on a day off today</p>
                            <p className="text-[10px] text-amber-600/70 dark:text-amber-400/60">Tasks won't count toward your score or streak.</p>
                        </div>
                    </div>
                )}

                {/* Task List or Start Button */}
                {!hasStartedJourney ? (
                    <main className="px-6 flex flex-col items-center justify-center py-10 mt-4 mb-20">
                        <div className="w-full max-w-sm text-center bg-white dark:bg-zinc-900 rounded-[32px] p-8 shadow-2xl relative overflow-hidden border border-rose-500/10">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>

                            <div className="w-16 h-16 mx-auto bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-rose-500 text-3xl">power_settings_new</span>
                            </div>

                            <h2 className="text-3xl font-black mb-4 uppercase tracking-tight text-charcoal dark:text-white">Activate System</h2>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                                You have zero tasks today. It's time to initiate your consistency engine. Are you prepared?
                            </p>
                            <button
                                onClick={() => setShowBrutalStartModal(true)}
                                className="w-full bg-charcoal dark:bg-white text-white dark:text-charcoal py-4 rounded-full font-black text-lg uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-charcoal/20 dark:shadow-white/10 flex items-center justify-center gap-3">
                                <span>START TODAY</span>
                                <span className="material-symbols-outlined font-bold">rocket_launch</span>
                            </button>
                        </div>
                    </main>
                ) : (
                    <main data-tour="task-card-area" className="px-6 space-y-6">
                        {/* History Tab Filter Bar */}
                        {activeTab === 'history' && (
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Date</label>
                                        <input
                                            type="date"
                                            value={historyDate}
                                            onChange={(e) => setHistoryDate(e.target.value)}
                                            className="w-full bg-white dark:bg-charcoal text-charcoal dark:text-white rounded-xl px-3 py-2.5 text-sm font-medium border border-slate-100 dark:border-slate-800 focus:ring-primary focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Status</label>
                                        <select
                                            value={historyStatus}
                                            onChange={(e) => setHistoryStatus(e.target.value)}
                                            className="w-full bg-white dark:bg-charcoal text-charcoal dark:text-white rounded-xl px-3 py-2.5 text-sm font-medium border border-slate-100 dark:border-slate-800 focus:ring-primary focus:border-primary outline-none appearance-none"
                                        >
                                            <option value="all">All</option>
                                            <option value="completed">Completed</option>
                                            <option value="missed">Missed</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="scheduled">Scheduled</option>
                                        </select>
                                    </div>
                                </div>
                                {(historyDate || historyStatus !== 'all') && (
                                    <button
                                        onClick={() => { setHistoryDate(''); setHistoryStatus('all'); }}
                                        className="text-xs font-bold text-primary flex items-center gap-1 hover:opacity-80 transition-opacity"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Render Full Cards for today/completed/missed tabs */}
                        {activeTab !== 'history' && filteredTasks.map((task, index) => {
                            const theme = getCardTheme(index, task.status);

                            let isStartLocked = false;
                            let startUnlockTime = null;
                            if (task.status === 'scheduled') {
                                const [startH, startM] = task.scheduled_start_time.split(':').map(Number);
                                const startDate = new Date();
                                startDate.setHours(startH, startM, 0, 0);
                                startUnlockTime = new Date(startDate.getTime() - 5 * 60000);
                                if (currentTime < startUnlockTime) isStartLocked = true;
                            }

                            let isLocked = true;
                            let unlockTime = null;
                            if (task.status === 'in_progress') {
                                const [endH, endM] = task.scheduled_end_time.split(':').map(Number);
                                const [startH, startM] = task.scheduled_start_time.split(':').map(Number);
                                const now = currentTime;
                                const endDate = new Date();
                                endDate.setHours(endH, endM, 0, 0);
                                const startDate = new Date();
                                startDate.setHours(startH, startM, 0, 0);
                                if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
                                unlockTime = new Date(endDate.getTime() - 5 * 60000);
                                if (now >= unlockTime) isLocked = false;
                            }

                            return (
                                <div
                                    key={task.id}
                                    onClick={() => navigate(`/audit/${task.id}`)}
                                    className={clsx("rounded-[32px] p-6 relative shadow-xl", theme.container)}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="max-w-[70%]">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className={clsx("text-[10px] font-bold uppercase tracking-widest", theme.tagColor)}>
                                                    {task.points >= 4 ? 'High Performance' : 'Maintenance'}
                                                </span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-20"></span>
                                                <span className={clsx("text-[10px] font-bold uppercase tracking-widest", theme.tagColor)}>
                                                    {task.points} Pts
                                                </span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-20"></span>
                                                <span className={clsx(
                                                    "text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md",
                                                    task.priority === 'high' ? "text-rose-500 bg-rose-500/10" :
                                                        task.priority === 'medium' ? "text-amber-500 bg-amber-500/10" :
                                                            task.priority === 'low' ? "text-sky-500 bg-sky-500/10" :
                                                                "text-gray-400 bg-gray-400/10"
                                                )}>
                                                    {task.priority ? task.priority.charAt(0).toUpperCase() : '-'}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-extrabold leading-tight">{task.title}</h3>
                                            {todayIsOff && new Date(task.created_at).toLocaleDateString('en-CA') === todayStr && (
                                                <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 bg-amber-400/20 text-amber-700 dark:text-amber-400 rounded-full">
                                                    🌿 Won't count today
                                                </span>
                                            )}
                                        </div>
                                        <button className={clsx("w-12 h-12 rounded-full flex items-center justify-center", theme.buttonBg, theme.buttonIconColor)}>
                                            <span className="material-icons-outlined">{theme.icon}</span>
                                        </button>
                                    </div>

                                    {/* Action Row (Start/End/Timer) */}
                                    <div className={clsx("flex items-center justify-between mb-4 p-3 rounded-2xl", theme.timerBg)}>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={(e) => handleStartClick(e, task.id)}
                                                    disabled={task.status !== 'scheduled' || isStartLocked}
                                                    className={clsx(
                                                        "px-4 py-1.5 text-[10px] font-bold rounded-full uppercase transition-opacity flex items-center gap-1",
                                                        theme.actionBtnStart,
                                                        (task.status !== 'scheduled' || isStartLocked) && "opacity-50 cursor-not-allowed"
                                                    )}
                                                    title={isStartLocked ? `Opens at ${startUnlockTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Start Task"}
                                                >
                                                    {isStartLocked && <span className="material-symbols-outlined text-[10px]">lock</span>}
                                                    Start
                                                </button>
                                                <button
                                                    disabled={isLocked}
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/complete/${task.id}`); }}
                                                    className={clsx(
                                                        "px-4 py-1.5 text-[10px] font-bold rounded-full uppercase transition-opacity flex items-center gap-1",
                                                        theme.actionBtnEnd,
                                                        isLocked && "opacity-50 cursor-not-allowed"
                                                    )}
                                                    title={isLocked ? (task.status === 'in_progress' ? `Task locks until ${unlockTime ? unlockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'end of task'}` : "Start task first") : "End Task"}
                                                >
                                                    {isLocked && task.status === 'in_progress' && <span className="material-symbols-outlined text-[10px]">lock</span>}
                                                    <span>End</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className={clsx("text-lg font-mono font-bold tracking-tighter", theme.timerText)}>
                                            {task.status !== 'missed' && task.actual_start_time ?
                                                <TaskTimer
                                                    startTime={task.actual_start_time}
                                                    endTime={task.actual_end_time}
                                                    scheduledEndTime={task.scheduled_end_time}
                                                />
                                                : "00:00:00"
                                            }
                                        </div>
                                    </div>

                                    <div className={clsx("flex items-center justify-between pt-4 border-t", theme.divider)}>
                                        <div className="flex items-center space-x-2 opacity-80 text-xs font-bold">
                                            <span className="material-icons-outlined text-sm">schedule</span>
                                            <span>{task.scheduled_start_time} - {task.scheduled_end_time}</span>
                                        </div>
                                        <span className={clsx("px-3 py-1 rounded-full text-[10px] font-bold uppercase", theme.statusBadge)}>
                                            {task.status.replace('_', '-')}
                                        </span>
                                    </div>
                                    <div className={clsx("absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-3 rounded-b-xl", theme.bottomTab)}></div>
                                </div>
                            );
                        })}

                        {/* Render Collapsible List for History tab */}
                        {activeTab === 'history' && (
                            <div className="space-y-2">
                                {filteredTasks.map((task) => {
                                    const isExpanded = expandedHistoryId === task.id;
                                    const taskDate = new Date(task.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                    return (
                                        <div key={task.id} className="bg-white dark:bg-charcoal rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-200">
                                            {/* Compact Row */}
                                            <button
                                                onClick={() => setExpandedHistoryId(isExpanded ? null : task.id)}
                                                className="w-full flex items-center justify-between p-4 text-left"
                                            >
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className={clsx(
                                                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                                        task.status === 'completed' ? "bg-emerald-50 dark:bg-emerald-500/10" :
                                                            task.status === 'missed' ? "bg-rose-50 dark:bg-rose-500/10" :
                                                                "bg-slate-50 dark:bg-slate-800"
                                                    )}>
                                                        <span className={clsx(
                                                            "material-symbols-outlined text-lg",
                                                            task.status === 'completed' ? "text-emerald-500" :
                                                                task.status === 'missed' ? "text-rose-500" :
                                                                    "text-slate-400"
                                                        )}>
                                                            {task.status === 'completed' ? 'check_circle' : task.status === 'missed' ? 'cancel' : 'schedule'}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="text-sm font-bold truncate text-charcoal dark:text-white">{task.title}</h4>
                                                        <p className="text-[10px] font-medium text-slate-400">{taskDate}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                                    <span className={clsx(
                                                        "text-xs font-bold",
                                                        task.status === 'completed' ? "text-emerald-500" :
                                                            task.status === 'missed' ? "text-rose-500" :
                                                                "text-slate-400"
                                                    )}>
                                                        {task.status === 'missed' ? `-${task.points}` : `+${task.points}`} pts
                                                    </span>
                                                    <span className={clsx(
                                                        "material-symbols-outlined text-slate-400 text-sm transition-transform duration-200",
                                                        isExpanded && "rotate-180"
                                                    )}>expand_more</span>
                                                </div>
                                            </button>

                                            {/* Expanded Details */}
                                            {isExpanded && (
                                                <div className="px-4 pb-4 pt-0 border-t border-slate-50 dark:border-white/5 space-y-3 animate-in slide-in-from-top-1 duration-200">
                                                    {task.description && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{task.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-xs">
                                                        <div className="flex items-center gap-1.5 text-slate-400">
                                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                                            <span className="font-medium">{task.scheduled_start_time} - {task.scheduled_end_time}</span>
                                                        </div>
                                                        <span className={clsx(
                                                            "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                                                            task.priority === 'high' ? "text-rose-500 bg-rose-500/10" :
                                                                task.priority === 'medium' ? "text-amber-500 bg-amber-500/10" :
                                                                    "text-sky-500 bg-sky-500/10"
                                                        )}>
                                                            {task.priority || 'normal'}
                                                        </span>
                                                        <span className={clsx(
                                                            "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                                                            task.status === 'completed' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" :
                                                                task.status === 'missed' ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" :
                                                                    "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                                        )}>
                                                            {task.status.replace('_', '-')}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/audit/${task.id}`)}
                                                        className="text-xs font-bold text-primary flex items-center gap-1 hover:opacity-80 transition-opacity"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                                                        View Full Audit
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {filteredTasks.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">checklist</span>
                                <p className="text-sm font-medium">{activeTab === 'history' ? 'No history matching filters' : 'No tasks found'}</p>
                            </div>
                        )}
                    </main>
                )}

                {/* Bottom Navigation */}
                <div data-tour="bottom-nav" className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] z-50">
                    <nav className="bg-charcoal dark:bg-zinc-900 rounded-full p-2 flex justify-between items-center shadow-2xl shadow-charcoal/20">
                        <button onClick={() => navigate('/')} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-charcoal shadow-sm">
                            <span className="material-icons-outlined">grid_view</span>
                        </button>
                        <button onClick={() => navigate('/friends')} className="w-14 h-14 text-white/50 flex items-center justify-center hover:text-primary transition-colors">
                            <span className="material-icons-outlined">group</span>
                        </button>
                        <button onClick={() => navigate('/add-task')} className="w-14 h-14 text-white/50 flex items-center justify-center hover:text-primary transition-colors">
                            <span className="material-icons-outlined">add_circle</span>
                        </button>
                        <button onClick={() => navigate('/leaderboard')} className="w-14 h-14 text-white/50 flex items-center justify-center hover:text-primary transition-colors">
                            <span className="material-icons-outlined">emoji_events</span>
                        </button>
                        <button onClick={() => navigate('/profile')} className="w-14 h-14 text-white/50 flex items-center justify-center hover:text-primary transition-colors">
                            <span className="material-icons-outlined">person</span>
                        </button>
                        <div className="absolute -top-1 left-[10%] w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(209,243,102,0.8)] opacity-0"></div>
                    </nav>
                </div>

                {/* Custom Toast Confirmation Modal */}
                {confirmTaskId && (
                    <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-24 md:pb-10 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-charcoal dark:bg-zinc-800 text-white p-6 rounded-[28px] shadow-2xl w-full max-w-sm border border-white/10 animate-in slide-in-from-bottom-5 duration-300">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 bg-primary/20 rounded-full">
                                    <span className="material-symbols-outlined text-primary text-xl">lock_clock</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-1">Ready to commit?</h3>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        Once started, this task is <strong>locked</strong>. You will only be able to mark it as complete 5 minutes before the scheduled end time.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmTaskId(null)}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmStart}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-primary text-charcoal hover:bg-primary/90 transition-colors"
                                >
                                    I'm Ready
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-charcoal/20 dark:bg-white/20 rounded-full"></div>
            </div>

            {/* Brutal Start Modal */}
            {showBrutalStartModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-charcoal dark:bg-zinc-900 text-white p-8 rounded-[32px] shadow-2xl w-full max-w-md border border-rose-500/30 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl"></div>

                        <div className="flex items-start gap-4 mb-8 relative z-10">
                            <div className="p-4 bg-rose-500/10 rounded-full shrink-0">
                                <span className="material-symbols-outlined text-rose-500 text-3xl">warning</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black mb-3 text-rose-500 uppercase tracking-tighter">Point of No Return</h3>
                                <div className="space-y-4 text-sm text-gray-300 leading-relaxed font-medium">
                                    <p>
                                        If you start today, there is <strong>no going back</strong>.
                                    </p>
                                    <p>
                                        The NoZero platform is <strong className="text-white">brutal</strong>. Miss a scheduled task? You lose points. End the day with a negative score? Your name will be permanently broadcasted on the <strong className="text-rose-400">Loser Board</strong>.
                                    </p>
                                    <p>
                                        Inconsistency is punished heavily. Be absolutely sure you are ready to commit to radical behavioral change before you proceed.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 relative z-10 w-full">
                            <button
                                onClick={() => {
                                    localStorage.setItem('nozero_journey_started', 'true');
                                    setHasStartedJourney(true);
                                    setShowBrutalStartModal(false);
                                }}
                                className="w-full py-4 rounded-xl font-black text-sm bg-rose-600 text-white hover:bg-rose-500 transition-colors uppercase tracking-widest shadow-lg shadow-rose-500/20"
                            >
                                I ACCEPT THE CONSEQUENCES
                            </button>
                            <button
                                onClick={() => setShowBrutalStartModal(false)}
                                className="w-full py-4 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 transition-colors text-gray-400 uppercase tracking-wide"
                            >
                                I'm Not Ready
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feature Tour */}
            {showTour && (
                <FeatureTour steps={TOUR_STEPS} onDone={handleTourDone} />
            )}
            {/* First Task Popup */}
            {showFirstTaskPopup && (
                <FirstTaskPopup onClose={() => setShowFirstTaskPopup(false)} />
            )}
        </div >
    );
}
