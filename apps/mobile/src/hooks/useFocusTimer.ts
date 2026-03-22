import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTimerStore } from '../store/timerStore';
import { useSessions } from './useSessions';
import { useNeyroStore } from '../store/useNeyroStore';

const MIN_SESSION_SECONDS = 60; // 1 minute minimum

export function useFocusTimer() {
    const {
        status,
        elapsed,
        startTime,
        start: startTimer,
        stop: stopTimer,
        reset: resetTimer,
        selectedProjectId,
        setSelectedProject,
        selectedTaskId,
        setSelectedTask
    } = useTimerStore();

    const { logFocusSession } = useSessions();
    const projects = useNeyroStore(state => state.activeProjects);
    // Note: Assuming tasks are available in store. If not, we might need to fetch or use prop drilling in components.
    // Ideally, pass tasks to the hook or use a selector if tasks are global. 
    // Since we added 'tasks' to NeyroStore recently:
    const tasks = useNeyroStore(state => state.tasks) || [];

    const isRunning = status === 'running';
    const currentProject = projects.find(p => p.id === selectedProjectId);
    const currentTask = tasks.find(t => t.id === selectedTaskId);

    const triggerHaptic = async (style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
        try {
            switch (style) {
                case 'light': await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); break;
                case 'medium': await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); break;
                case 'heavy': await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); break;
                case 'success': await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
                case 'warning': await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); break;
                case 'error': await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); break;
            }
        } catch {
            // Haptics not supported
        }
    };

    const handleStart = useCallback(() => {
        triggerHaptic('medium');
        startTimer();
    }, [startTimer]);

    const handlePause = useCallback(() => {
        triggerHaptic('heavy');
        stopTimer();
    }, [stopTimer]);

    const handleResume = useCallback(() => {
        triggerHaptic('medium');
        startTimer();
    }, [startTimer]);

    const handleSave = useCallback(async (shouldLog = true) => {
        // If user just wants to exit without logging:
        if (!shouldLog) {
            resetTimer();
            return true;
        }

        if (elapsed < MIN_SESSION_SECONDS) {
            triggerHaptic('warning');
            const shouldDiscard = await new Promise((resolve) => {
                Alert.alert(
                    'Session Short',
                    'Less than a minute focused. Log it anyway?',
                    [
                        { text: 'Discard', onPress: () => resolve(true), style: 'cancel' },
                        { text: 'Log', onPress: () => resolve(false) }
                    ]
                );
            });
            if (shouldDiscard) {
                resetTimer();
                return true;
            }
        }

        // If simple stop requested (no project mandatory), just log to Inbox or General
        triggerHaptic('success');

        // Log to DB
        const durationMinutes = Math.floor(elapsed / 60);
        const sessionNotes = currentTask ? `Focused on task: ${currentTask.title}` : null;

        // Fire and forget logging - don't block UI
        logFocusSession(
            selectedProjectId || '', // Optional project
            durationMinutes || 1,
            sessionNotes,
            null,
            new Date().toISOString().split('T')[0]
        ).catch(err => console.log('Background log failed', err));

        // Immediate feedback
        // Alert.alert('Focus Logged!', `Great job! Logged ${durationMinutes}m for ${focusLabel}`); 
        // User requested "don't make it so you save", so we silence the success alert or make it toast-like?
        // Let's just reset and return.

        resetTimer();
        return true;
    }, [elapsed, selectedProjectId, selectedTaskId, logFocusSession, currentTask, resetTimer]);

    const handleSelectProject = useCallback((projectId: string) => {
        setSelectedProject(projectId);
        setSelectedTask(null); // Clear task if project changes manually
        triggerHaptic('light');
    }, [setSelectedProject, setSelectedTask]);

    const handleSelectTask = useCallback((taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            setSelectedTask(taskId);
            if (task.parentType === 'project') {
                setSelectedProject(task.parentId);
            }
        }
        triggerHaptic('light');
    }, [tasks, setSelectedTask, setSelectedProject]);

    return {
        status,
        elapsed,
        isRunning,
        start: handleStart,
        pause: handlePause,
        resume: handleResume,
        save: handleSave,
        selectProject: handleSelectProject,
        selectTask: handleSelectTask,
        selectedProjectId,
        selectedTaskId,
        currentProject,
        currentTask
    };
}
