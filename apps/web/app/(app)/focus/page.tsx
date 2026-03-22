'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { Play, Pause, Square, ChevronDown, CheckCircle2, Clock, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Project, Task } from '@mobile/database/schema';
import { motion } from 'framer-motion';
import { TodayList } from '@/components/TodayList';
import { useTodayList } from '@/hooks/useTodayList';

type TimerStatus = 'idle' | 'running' | 'paused';

export default function FocusPage() {
    const router = useRouter();
    const [status, setStatus] = useState<TimerStatus>('idle');
    const [elapsed, setElapsed] = useState(0);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [showPicker, setShowPicker] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [duration, setDuration] = useState<25 | 50 | 90>(25);
    const [targetDuration, setTargetDuration] = useState<number>(25 * 60); // in seconds

    // @ts-ignore
    const activeProjects = useNeyroStore((state: any) => state.activeProjects || []);
    // @ts-ignore
    const tasks = useNeyroStore((state: any) => state.tasks || []);
    // @ts-ignore
    const loadData = useNeyroStore((state: any) => state.loadData);
    const { todayActions } = useTodayList();

    useEffect(() => {
        loadData();
        // Check for URL params
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get('project');
        if (projectId) {
            setSelectedProjectId(projectId);
        }
    }, []);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (status === 'running' && startTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const diff = Math.floor((now - startTime) / 1000);
                setElapsed(diff);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status, startTime]);

    const currentProject = activeProjects.find((p: Project) => p.id === selectedProjectId);
    const currentTask = tasks.find((t: Task) => t.id === selectedTaskId);

    const handleStart = () => {
        // Auto-select first project if none selected (reduce friction)
        if (!selectedProjectId && !selectedTaskId && activeProjects.length > 0) {
            setSelectedProjectId(activeProjects[0].id);
        }
        if (!selectedProjectId && !selectedTaskId) {
            setShowPicker(true);
            return;
        }
        setStatus('running');
        setStartTime(Date.now() - elapsed * 1000);
        setTargetDuration(duration * 60);
    };

    const handlePause = () => {
        setStatus('paused');
    };

    const handleResume = () => {
        setStatus('running');
        setStartTime(Date.now() - elapsed * 1000);
    };

    const [sessionResult, setSessionResult] = useState<'done' | 'abandoned' | null>(null);

    const handleSave = async (result: 'done' | 'abandoned' = 'done') => {
        // Auto-save if less than 1 minute (reduce friction)
        if (elapsed < 60 && result === 'abandoned') {
            handleReset();
            router.push('/');
            return;
        }

        const durationMinutes = Math.floor(elapsed / 60) || 1;
        const notes = currentTask ? `Focused on task: ${currentTask.title}` : (currentProject ? `Focused on: ${currentProject.title}` : null);

        // Log session (would integrate with useSessions hook)
        try {
            // This would call logFocusSession from useSessions
            console.log('Logging session:', { selectedProjectId, durationMinutes, notes, result });
            setSessionResult(result);
            setTimeout(() => {
                handleReset();
                router.push('/');
            }, 1000); // Faster transition
        } catch (e) {
            console.error('Failed to log session', e);
        }
    };

    const handleReset = () => {
        setStatus('idle');
        setElapsed(0);
        setStartTime(null);
    };

    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const projectTasks = selectedProjectId 
        ? tasks.filter((t: Task) => t.parentId === selectedProjectId && t.parentType === 'project')
        : [];

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-4">
            {/* Today's Plan */}
            <TodayList />

            {/* Project/Task Selector */}
            <div className="flex flex-col items-center gap-4">
                <p className="text-xs uppercase tracking-wider text-neutral-500 font-bold">FOCUSING ON</p>
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
                >
                    {currentTask ? (
                        <>
                            <CheckCircle2 className="size-5 text-primary" />
                            <span className="text-lg font-semibold text-white">{currentTask.title}</span>
                        </>
                    ) : currentProject ? (
                        <>
                            <div className="size-5 rounded bg-primary/20 flex items-center justify-center">
                                <div className="size-3 rounded bg-primary" />
                            </div>
                            <span className="text-lg font-semibold text-white">{currentProject.title}</span>
                        </>
                    ) : (
                        <>
                            <Clock className="size-5 text-neutral-500" />
                            <span className="text-lg font-semibold text-neutral-400">Select Focus</span>
                        </>
                    )}
                    <ChevronDown className={cn("size-5 text-neutral-500 transition-transform", showPicker && "rotate-180")} />
                </button>
            </div>

            {/* Picker Modal */}
            {showPicker && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Select Focus</h3>
                            <button
                                onClick={() => setShowPicker(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <X className="size-5 text-neutral-400" />
                            </button>
                        </div>

                        {/* Today's Actions */}
                        {todayActions.length > 0 && (
                            <div className="mb-6">
                                <p className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-3">Today's Plan</p>
                                <div className="space-y-2">
                                    {todayActions.map((action) => (
                                        <button
                                            key={action.id}
                                            onClick={() => {
                                                if (action.sourceType === 'project') {
                                                    setSelectedProjectId(action.sourceId);
                                                    setSelectedTaskId(null);
                                                } else if (action.sourceType === 'task') {
                                                    setSelectedTaskId(action.sourceId);
                                                    setSelectedProjectId(null);
                                                }
                                                setShowPicker(false);
                                            }}
                                            className="w-full text-left px-4 py-3 rounded-lg border border-primary/30 bg-primary/10 text-white hover:bg-primary/20 transition-all"
                                        >
                                            <div className="font-semibold">{action.title}</div>
                                            <div className="text-xs text-neutral-400 mt-1">
                                                {action.timeEstimate}m • {action.priority} priority
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        <div className="mb-6">
                            <p className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-3">Projects</p>
                            <div className="space-y-2">
                                {activeProjects.map((project: Project) => (
                                    <button
                                        key={project.id}
                                        onClick={() => {
                                            setSelectedProjectId(project.id);
                                            setSelectedTaskId(null);
                                            setShowPicker(false);
                                        }}
                                        className={cn(
                                            "w-full text-left px-4 py-3 rounded-lg border transition-all",
                                            selectedProjectId === project.id
                                                ? "bg-primary/20 border-primary text-white"
                                                : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
                                        )}
                                    >
                                        <div className="font-semibold">{project.title}</div>
                                        {project.description && (
                                            <div className="text-xs text-neutral-500 mt-1">{project.description}</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tasks */}
                        {selectedProjectId && projectTasks.length > 0 && (
                            <div>
                                <p className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-3">Tasks</p>
                                <div className="space-y-2">
                                    {projectTasks.map((task: Task) => (
                                        <button
                                            key={task.id}
                                            onClick={() => {
                                                setSelectedTaskId(task.id);
                                                setSelectedProjectId(null);
                                                setShowPicker(false);
                                            }}
                                            className={cn(
                                                "w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center gap-3",
                                                selectedTaskId === task.id
                                                    ? "bg-primary/20 border-primary text-white"
                                                    : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
                                            )}
                                        >
                                            <CheckCircle2 className={cn(
                                                "size-4",
                                                task.isCompleted ? "text-green-400" : "text-neutral-500"
                                            )} />
                                            <span className="font-medium">{task.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Duration Selector */}
            {status === 'idle' && (
                <div className="flex items-center gap-3 mb-4">
                    <p className="text-sm text-neutral-400">Duration:</p>
                    {[25, 50, 90].map((mins) => (
                        <button
                            key={mins}
                            onClick={() => setDuration(mins as 25 | 50 | 90)}
                            className={cn(
                                "px-4 py-2 rounded-lg font-semibold transition-all",
                                duration === mins
                                    ? "bg-primary text-white"
                                    : "bg-white/5 text-neutral-400 hover:bg-white/10"
                            )}
                        >
                            {mins}m
                        </button>
                    ))}
                </div>
            )}

            {/* Timer Display */}
            <div className="flex flex-col items-center gap-6">
                <div className="text-7xl md:text-8xl font-mono font-bold text-white tabular-nums">
                    {formatTime(elapsed)}
                </div>
                
                {/* Progress Bar */}
                {status === 'running' && targetDuration > 0 && (
                    <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((elapsed / targetDuration) * 100, 100)}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                )}

                {/* Controls */}
                <div className="flex items-center gap-4">
                    {status === 'idle' && (
                        <Button
                            onClick={handleStart}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-[0_0_30px_-5px_rgba(255,139,61,0.6)]"
                        >
                            <Play className="size-5 mr-2" fill="currentColor" />
                            Start
                        </Button>
                    )}

                    {status === 'running' && (
                        <>
                            <Button
                                onClick={handlePause}
                                variant="secondary"
                                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full"
                            >
                                <Pause className="size-5 mr-2" fill="currentColor" />
                                Pause
                            </Button>
                            <Button
                                onClick={() => handleSave('done')}
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full"
                            >
                                <CheckCircle className="size-5 mr-2" fill="currentColor" />
                                Done
                            </Button>
                            <Button
                                onClick={() => handleSave('abandoned')}
                                variant="secondary"
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-6 py-3 rounded-full"
                            >
                                <Square className="size-5 mr-2" fill="currentColor" />
                                Abandon
                            </Button>
                        </>
                    )}

                    {status === 'paused' && (
                        <>
                            <Button
                                onClick={handleResume}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full"
                            >
                                <Play className="size-5 mr-2" fill="currentColor" />
                                Resume
                            </Button>
                            <Button
                                onClick={handleReset}
                                variant="secondary"
                                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full"
                            >
                                Reset
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Success Animation */}
            {sessionResult && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
                >
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                        >
                            <CheckCircle className="size-16 text-green-400 mx-auto mb-4" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            {sessionResult === 'done' ? 'Focus Session Complete!' : 'Session Abandoned'}
                        </h3>
                        <p className="text-neutral-400">
                            {formatTime(elapsed)} logged
                        </p>
                    </motion.div>
                </motion.div>
            )}

            {/* Quote */}
            <p className="text-neutral-500 text-center max-w-md italic">
                "The successful warrior is the average man, with laser-like focus."
            </p>
        </div>
    );
}
