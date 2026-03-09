import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { differenceInMinutes, parseISO } from 'date-fns';

export const TaskContext = createContext();

export function TaskProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [friends, setFriends] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user profile
    const fetchProfile = useCallback(async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setUser((prev) => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.warn("Profile fetch error:", error);
        }
    }, []);

    // ─── Day-Off helpers ──────────────────────────────────────────────────────────

    // Returns YYYY-MM-DD for a Date object in local time
    const toLocalDateStr = (date = new Date()) =>
        date.toLocaleDateString('en-CA');

    // Returns true if dateStr falls in the same ISO week (Mon–Sun) as today
    const isSameWeek = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        const getMonday = (dt) => {
            const copy = new Date(dt);
            const day = copy.getDay(); // 0=Sun
            const diff = (day === 0 ? -6 : 1 - day);
            copy.setDate(copy.getDate() + diff);
            copy.setHours(0, 0, 0, 0);
            return copy;
        };
        return getMonday(d).getTime() === getMonday(today).getTime();
    };

    // Returns number of day-offs taken this week
    const dayOffsThisWeek = (dates) =>
        (dates || []).filter(isSameWeek).length;

    // Returns true if the given date string is a day-off
    const isDayOff = (dateStr) =>
        (user?.day_off_dates || []).includes(dateStr);

    // Mark today (or a passed dateStr) as a day-off
    const markDayOff = async (dateStr) => {
        if (!user) return { error: 'Not logged in' };
        const dates = user.day_off_dates || [];

        if (dates.includes(dateStr)) return { error: 'Already a day-off' };

        if (dayOffsThisWeek(dates) >= 2) {
            return { error: 'You have already used 2 day-offs this week.' };
        }

        const newDates = [...dates, dateStr];
        const { error } = await supabase
            .from('profiles')
            .update({ day_off_dates: newDates })
            .eq('id', user.id);

        if (error) return { error: error.message };

        setUser(prev => ({ ...prev, day_off_dates: newDates }));
        return { success: true };
    };

    // Fetch tasks
    const fetchTasks = useCallback(async (userId) => {
        // console.log("[TaskContext] fetchTasks: Fetching for user:", userId);
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error("[TaskContext] fetchTasks Error:", error);
                throw error;
            }

            setTasks(data || []);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    }, []);

    // Fetch Friends (Bidirectional)
    const fetchFriends = useCallback(async (userId) => {
        try {
            // Fetch interactions where user is sender OR receiver
            const { data, error } = await supabase
                .from('friends')
                .select(`
                    id,
                    status,
                    user_id,
                    friend_id,
                    sender:profiles!user_id(*),
                    receiver:profiles!friend_id(*)
                `)
                .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

            if (error) throw error;

            // Normalize data: "friend" should always be the OTHER person
            const formattedFriends = (data || []).map(f => {
                const isSender = f.user_id === userId;
                return {
                    ...f,
                    isSender, // To know if I sent it or received it
                    friend: isSender ? f.receiver : f.sender // The other person
                };
            });

            setFriends(formattedFriends);
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    }, []);

    // Search Users
    const searchUsers = async (query) => {
        if (!query || query.length < 3) return []; // Minimum 3 chars
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .ilike('username', `%${query}%`)
                .limit(10); // Limit results

            if (error) throw error;
            // Filter out current user and existing friends (optional, or handle in UI)
            return data.filter(p => p.id !== user?.id && !p.is_admin) || [];
        } catch (error) {
            console.error("Error searching users:", error);
            return [];
        }
    };

    // Fetch Friend's Tasks (Secure RPC)
    const fetchFriendTasks = useCallback(async (friendId) => {
        try {
            const { data, error } = await supabase
                .rpc('get_friend_tasks', { target_user_id: friendId });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error fetching friend tasks:", error);
            return [];
        }
    }, []);

    // Leaderboard sort helpers
    const RANK_ORDER = { 'SSS+': 10, 'SSS': 9, 'SS+': 8, 'SS': 7, 'S': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };
    const TIER_ORDER = { 'Tier 1': 10, 'Tier 2': 9, 'Tier 3': 8, 'Tier 4': 7, 'Tier 5': 6, 'Tier 6': 5, 'Tier 7': 4, 'Tier 8': 3, 'Tier 9': 2, 'Tier 10': 1, 'Unranked': 0 };

    // Fetch Leaderboard
    const fetchLeaderboard = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('is_admin', false)
                .limit(100);

            if (error) throw error;

            // Sort: rank_label desc → tier desc → active_30_day_score desc → streak desc
            const sorted = (data || []).sort((a, b) => {
                const rankDiff = (RANK_ORDER[b.rank_label] ?? 0) - (RANK_ORDER[a.rank_label] ?? 0);
                if (rankDiff !== 0) return rankDiff;
                const tierDiff = (TIER_ORDER[b.tier_status] ?? 0) - (TIER_ORDER[a.tier_status] ?? 0);
                if (tierDiff !== 0) return tierDiff;
                const scoreDiff = (b.active_30_day_score ?? 0) - (a.active_30_day_score ?? 0);
                if (scoreDiff !== 0) return scoreDiff;
                return (b.current_streak ?? 0) - (a.current_streak ?? 0);
            });

            setLeaderboard(sorted);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        }
    }, []);

    // Fetch Loserboard (Users penalized in the last 24 hours)
    const fetchLoserboard = useCallback(async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('is_admin', false)
                .eq('last_penalty_date', today)
                .order('consistency_score', { ascending: true }) // Lowest score first
                .limit(50);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error fetching loserboard:", error);
            return [];
        }
    }, []);

    // Fetch Audit Logs
    // Fetch Audit Logs (Detailed)
    const fetchAuditLogs = useCallback(async (userId) => {
        try {
            const { data, error } = await supabase
                .from('audits')
                .select(`
                    *,
                    tasks (
                        title,
                        points,
                        scheduled_end_time,
                        actual_end_time
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAuditLogs(data || []);
        } catch (error) {
            console.error("Error fetching audit logs:", error);
        }
    }, []);

    // 1. Auth Subscription Setup
    useEffect(() => {
        // console.log("[TaskContext] Setting up auth listener.");

        // Check active session immediately
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // console.log(`[TaskContext] Auth Change: ${_event}`);
            setSession(session);
            if (_event === 'SIGNED_OUT') {
                setUser(null);
                setTasks([]);
                setFriends([]);
                setAuditLogs([]);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. Data Fetching Effect (Triggers when session changes)
    useEffect(() => {
        if (session?.user) {
            const userId = session.user.id;
            // console.log("[TaskContext] Session detected. Fetching data for:", userId);

            // Set basic user info from session immediately
            setUser({ id: userId, email: session.user.email });

            // Run full scoring pipeline (backfill penalties → refresh tier → cycle check)
            supabase.rpc('on_app_open', { p_user_id: userId })
                .then(async () => {
                    await fetchProfile(userId);
                    await fetchTasks(userId);
                    await fetchFriends(userId);
                    await fetchAuditLogs(userId);
                    await fetchLeaderboard();
                })
                .then(() => {
                    setLoading(false);
                }).catch(err => {
                    console.error("[TaskContext] Data fetch error:", err);
                    setLoading(false);
                });
        } else if (!session && !loading) {
            // Already handled in onAuthStateChange, but double check
            // console.log("[TaskContext] No session. Loading complete.");
        }
    }, [session, fetchProfile, fetchTasks, fetchFriends, fetchAuditLogs, fetchLeaderboard]);

    // 3. Auto-Mark Missed Tasks (Interval Check)
    useEffect(() => {
        if (!tasks.length) return;

        const interval = setInterval(() => {
            const now = new Date();
            const todayStr = now.toLocaleDateString('en-CA');

            const updates = tasks.map(async (task) => {
                if (task.status !== 'scheduled') return null;

                // Simple check: Is created_at today?
                const taskDate = new Date(task.created_at).toLocaleDateString('en-CA');
                if (taskDate !== todayStr) return null;

                const [h, m] = task.scheduled_start_time.split(':').map(Number);
                const scheduledStart = new Date();
                scheduledStart.setHours(h, m, 0, 0);

                // Add 5 min buffer
                const missThreshold = new Date(scheduledStart.getTime() + 5 * 60000);

                if (now > missThreshold) {
                    // console.log(`[TaskContext] Auto-marking task ${task.id} as missed`);
                    const { data, error } = await supabase
                        .from('tasks')
                        .update({ status: 'missed' })
                        .eq('id', task.id)
                        .select()
                        .single();

                    if (!error && data) {
                        return { id: task.id, status: 'missed', points: task.points || 0 };
                    }
                }
                return null;
            });

            Promise.all(updates).then(async (results) => {
                const changes = results.filter(r => r !== null);
                if (changes.length > 0) {
                    setTasks(prev => prev.map(t => {
                        const change = changes.find(c => c.id === t.id);
                        return change ? { ...t, status: change.status } : t;
                    }));

                    // Increment missed_tasks_count and potentially apply penalty
                    if (user) {
                        const { data: currentProfile } = await supabase.from('profiles').select('consistency_score, last_penalty_date, missed_tasks_count, current_streak').eq('id', user.id).single();

                        if (currentProfile) {
                            const newCount = (currentProfile.missed_tasks_count || 0) + changes.length;
                            // Deduct points for each missed task (same amount they would have gained)
                            const totalDeducted = changes.reduce((sum, c) => sum + (c.points || 0), 0);
                            const newScore = (currentProfile.consistency_score || 0) - totalDeducted;

                            let updates = { missed_tasks_count: newCount, consistency_score: newScore };
                            const { error: profileError } = await supabase
                                .from('profiles')
                                .update(updates)
                                .eq('id', user.id);

                            if (!profileError) {
                                setUser(prev => ({ ...prev, ...updates }));
                            }
                        }
                    }
                }
            });
        }, 15000); // Check every 15s

        return () => clearInterval(interval);
    }, [tasks]);


    // Auth Actions
    const signUp = useCallback(async (email, password, username) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username },
                emailRedirectTo: 'https://no-zero-app.vercel.app/login'
            }
        });
        if (error) throw error;
        return data;
    }, []);

    const signIn = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    }, []);

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setSession(null);
        setUser(null);
    }, []);

    // Task Actions
    const addTask = useCallback(async (newTask) => {
        // console.log("[TaskContext] addTask: Triggered with:", newTask);

        if (!user) {
            console.error("[TaskContext] addTask: Attempted to add task but user is null");
            return null;
        }

        const taskData = {
            user_id: user.id,
            title: newTask.title,
            description: newTask.description,
            scheduled_start_time: newTask.scheduled_start_time,
            scheduled_end_time: newTask.scheduled_end_time,
            priority: newTask.priority,
            points: newTask.points,
            status: 'scheduled',
            created_at: new Date().toISOString()
        };

        try {
            // console.log("[TaskContext] addTask: Inserting into Supabase...");
            const { data, error } = await supabase
                .from('tasks')
                .insert([taskData])
                .select()
                .single();

            if (error) {
                console.error("[TaskContext] addTask: Supabase error:", error);
                return null;
            }

            // console.log("[TaskContext] addTask: Insert successful:", data);

            // Optimistic update
            setTasks((prev) => [...prev, data]);

            return data;
        } catch (err) {
            console.error("[TaskContext] addTask: Unexpected error:", err);
            return null;
        }
    }, [user]);

    const startTask = useCallback(async (taskId) => {
        const now = new Date();
        // Use local date string (YYYY-MM-DD)
        const today = now.toLocaleDateString('en-CA');
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // Block if already missed/completed
        if (task.status === 'missed' || task.status === 'completed') return;

        const scheduled = parseISO(`${today}T${task.scheduled_start_time}`);
        const diff = differenceInMinutes(now, scheduled); // now - scheduled => negative if early

        // Validation: Block if too early (> 5 mins before start)
        if (diff < -5) {
            console.warn(`[startTask] Blocked: Too early. Diff: ${diff}`);
            return;
        }

        // Validation: If > 5 mins late, mark as missed and DO NOT start timer
        if (diff > 5) {
            console.warn(`[startTask] Late start. Marking missed. Diff: ${diff}`);
            const { data, error } = await supabase
                .from('tasks')
                .update({ status: 'missed' })
                .eq('id', taskId)
                .select()
                .single();

            if (!error) {
                setTasks((prev) => prev.map(t => t.id === taskId ? data : t));

                // Increment missed_tasks_count and deduct points for missed task
                if (user) {
                    const { data: currentProfile } = await supabase.from('profiles').select('consistency_score, last_penalty_date, missed_tasks_count, current_streak').eq('id', user.id).single();

                    if (currentProfile) {
                        const newCount = (currentProfile.missed_tasks_count || 0) + 1;
                        const newScore = (currentProfile.consistency_score || 0) - (task.points || 0);

                        let updates = { missed_tasks_count: newCount, consistency_score: newScore };

                        const { error: profileError } = await supabase
                            .from('profiles')
                            .update(updates)
                            .eq('id', user.id);

                        if (!profileError) {
                            setUser(prev => ({ ...prev, ...updates }));
                        }
                    }
                }
            } else {
                console.error("Error marking task as missed:", error);
            }
            return;
        }

        // Allow starting if <= 5 mins late
        let status = 'in_progress';

        const { data, error } = await supabase
            .from('tasks')
            .update({ status, actual_start_time: now.toISOString() })
            .eq('id', taskId)
            .select()
            .single();

        if (error) {
            console.error("Error starting task:", error);
            return;
        }

        setTasks((prev) => prev.map(t => t.id === taskId ? data : t));
    }, [tasks]);

    const updateTask = useCallback(async (taskId, updates) => {
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId)
            .select()
            .single();

        if (error) {
            console.error("Error updating task:", error);
            return;
        }

        setTasks((prev) => prev.map(t => t.id === taskId ? data : t));
    }, []);



    const completeTask = useCallback(async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.status !== 'in_progress') {
            console.warn("Cannot complete task that is not in progress.");
            return;
        }

        const { data, error } = await supabase
            .from('tasks')
            .update({ status: 'completed', actual_end_time: new Date().toISOString() })
            .eq('id', taskId)
            .select()
            .single();

        if (error) {
            console.error("Error completing task:", error);
            return;
        }

        // Optimistically update tasks list
        const updatedTasks = tasks.map(t => t.id === taskId ? data : t);
        setTasks(updatedTasks);

        // Calculate Daily Scoring & Streak
        if (user) {
            const todayStr = new Date().toLocaleDateString('en-CA');

            // If today is a day-off, don't award any points or streak
            if (isDayOff(todayStr)) {
                console.log('[TaskContext] Day-off active — task completed but no points awarded.');
                return;
            }

            // Sum points of all COMPLETED tasks for today (including the one just completed)
            const completedToday = updatedTasks.filter(t =>
                t.status === 'completed' &&
                t.actual_end_time?.startsWith(todayStr)
            );

            const totalPointsToday = completedToday.reduce((sum, t) => sum + (t.points || 0), 0);
            const dailyTarget = 10;

            console.log(`[TaskContext] Task Completed. Total Points Today: ${totalPointsToday}/${dailyTarget}`);

            let updates = {};

            // 1. Always increment Consistency Score (No Cap)
            const newConsistencyScore = (user.consistency_score || 0) + (data.points || 0);
            updates.consistency_score = newConsistencyScore;

            // 2. Check Daily Streak Target
            if (totalPointsToday >= dailyTarget) {
                if (user.last_success_date !== todayStr) {
                    console.log("[TaskContext] Daily Target (10pts) Met! Incrementing Streak.");
                    updates.current_streak = (user.current_streak || 0) + 1;
                    updates.last_success_date = todayStr;
                }
            }

            if (Object.keys(updates).length > 0) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', user.id);

                if (!updateError) {
                    setUser(u => ({ ...u, ...updates }));
                } else {
                    console.error("Error updating profile stats:", updateError);
                }
            }
        }
    }, [user, tasks]);

    const checkStreakReset = useCallback(async (profile) => {
        if (!profile || !profile.last_success_date) return;

        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('en-CA');
        const todayStr = now.toLocaleDateString('en-CA');

        const dayOffDates = profile.day_off_dates || [];
        if (dayOffDates.includes(yesterdayStr)) {
            console.log(`[TaskContext] Streak protected: yesterday (${yesterdayStr}) was a day-off.`);
            return;
        }

        // If last success was strictly before yesterday, penalize for missing a day.
        if (profile.last_success_date < yesterdayStr) {
            // Fresh read to prevent race conditions
            const { data: currentProfile } = await supabase.from('profiles').select('consistency_score, last_penalty_date').eq('id', profile.id).single();

            // VERY IMPORTANT: Check todayStr, not yesterdayStr. The penalty happens TODAY for missing yesterday.
            if (currentProfile && currentProfile.last_penalty_date !== todayStr) {
                // Fetch tasks from yesterday to see points earned
                const { data: yesterdayTasks } = await supabase
                    .from('tasks')
                    .select('points, actual_end_time, status')
                    .eq('user_id', profile.id)
                    .eq('status', 'completed')
                    .like('actual_end_time', `${yesterdayStr}%`);

                const yesterdayPoints = (yesterdayTasks || []).reduce((sum, t) => sum + (t.points || 0), 0);

                let newScore = currentProfile.consistency_score || 0;
                let updates = {
                    last_penalty_date: todayStr
                };

                if (yesterdayPoints === 0) {
                    // Missed the day completely: 0 tasks/points tracked.
                    console.log(`[TaskContext] Missed yesterday completely. Applying -10 penalty and resetting streak.`);
                    newScore = Math.max(0, newScore - 10);
                    updates.current_streak = 0;
                } else if (yesterdayPoints < 10) {
                    // Failed the 10-point streak target, but earned some points.
                    console.log(`[TaskContext] Earned ${yesterdayPoints} yesterday (Failed 10pt target). Resetting streak, no penalty.`);
                    updates.current_streak = 0;
                } else {
                    // Hit the target yesterday (this would usually be caught by completeTask on the day, but just in case)
                    console.log(`[TaskContext] Safe zone achieved yesterday (${yesterdayPoints} pts).`);
                }

                updates.consistency_score = newScore;

                const { error } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', profile.id);

                if (!error) {
                    setUser(prev => ({ ...prev, ...updates }));
                }
            }
        }
    }, []);

    // Effect to check streak reset when user is loaded
    useEffect(() => {
        if (user) {
            checkStreakReset(user);
        }
    }, [user?.id, checkStreakReset]);


    const deleteTask = async (taskId) => {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            console.error("Error deleting task:", error);
            return;
        }

        setTasks((prev) => prev.filter(t => t.id !== taskId));
    };

    // Friend Actions
    const acceptFriendRequest = async (friendshipId) => {
        const { error } = await supabase
            .from('friends')
            .update({ status: 'accepted' })
            .eq('id', friendshipId)
            .select()
            .single();

        if (error) {
            console.error("Error accepting friend request:", error);
            return;
        }
        setFriends((prev) => prev.map(f => f.id === friendshipId ? { ...f, status: 'accepted' } : f));
    };

    const rejectFriendRequest = async (friendshipId) => {
        const { error } = await supabase
            .from('friends')
            .delete()
            .eq('id', friendshipId);

        if (error) {
            console.error("Error rejecting friend request:", error);
            return;
        }
        setFriends((prev) => prev.filter(f => f.id !== friendshipId));
    };

    const sendFriendRequest = async (friendId) => {
        if (!user) return;
        const { data, error } = await supabase
            .from('friends')
            .insert([{ user_id: user.id, friend_id: friendId, status: 'pending' }])
            .select(`
                id,
                status,
                user_id,
                friend_id,
                sender:profiles!user_id(*),
                receiver:profiles!friend_id(*)
            `)
            .single();

        if (error) {
            console.error("Error sending friend request:", error);
            return;
        }
        // Normalize: isSender=true, friend = the receiver (the person we sent to)
        const normalized = { ...data, isSender: true, friend: data.receiver };
        setFriends((prev) => [...prev, normalized]);
    };

    const cancelFriendRequest = async (friendshipId) => {
        const { error } = await supabase
            .from('friends')
            .delete()
            .eq('id', friendshipId);

        if (error) {
            console.error("Error cancelling friend request:", error);
            return;
        }
        setFriends((prev) => prev.filter(f => f.id !== friendshipId));
    };

    // Storage Actions
    const uploadAvatar = async (file) => {
        if (!user) return;
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setUser(prev => ({ ...prev, avatar_url: publicUrl }));
            return publicUrl;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        }
    };

    const saveAudit = useCallback(async (auditData) => {
        if (!user) return;

        console.log("[TaskContext] Saving audit for task:", auditData.taskId);

        // 1. Calculate duration if not provided
        // We can get task start time from tasks list if needed, but let's assume valid data for now
        // For now, duration is calculated in TaskAudit or here? 
        // Let's expect 'duration_minutes' in auditData.

        const { error } = await supabase
            .from('audits')
            .insert([{
                user_id: user.id,
                task_id: auditData.taskId,
                completion_status: auditData.completionStatus,
                performance_reason: auditData.performanceReason,
                distractions: auditData.distractions,
                duration_minutes: auditData.durationMinutes
            }]);

        if (error) {
            console.error("Error saving audit:", error);
            // We might want to throw here so UI knows
            throw error;
        }

        // Refresh audit logs
        fetchAuditLogs(user.id);
    }, [user, fetchAuditLogs]);

    return (
        <TaskContext.Provider value={{
            tasks,
            user,
            friends,
            leaderboard,
            auditLogs,
            loading,
            signUp,
            signIn,
            signOut,
            addTask,
            startTask,
            completeTask,
            deleteTask,
            acceptFriendRequest,
            rejectFriendRequest,
            sendFriendRequest,
            cancelFriendRequest,
            uploadAvatar,
            fetchLeaderboard,
            fetchLoserboard,
            updateTask,
            saveAudit,
            searchUsers,
            fetchFriendTasks,
            // Day-off
            isDayOff,
            markDayOff,
            dayOffsThisWeek: () => dayOffsThisWeek(user?.day_off_dates),
        }}>
            {children}
        </TaskContext.Provider>
    );
}
