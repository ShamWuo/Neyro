'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, Plus, Clock, Edit, Check, X, CalendarDays, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { desc } from 'drizzle-orm';
import { db } from '@mobile/database/client';
import { scheduledSessions, projects } from '@mobile/database/schema';
import { eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { CalendarView } from '@/components/CalendarView';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

type ViewMode = 'calendar' | 'list';

export default function SchedulePage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('calendar');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    // @ts-ignore
    const activeProjects = useNeyroStore((state: any) => state.activeProjects || []);
    // @ts-ignore
    const inbox = useNeyroStore((state: any) => state.inbox || []);

    useEffect(() => {
        fetchSessions();
    }, []);

    async function fetchSessions() {
        try {
            setIsLoading(true);
            const allSessions = await db
                .select({
                    session: scheduledSessions,
                    project: projects,
                })
                .from(scheduledSessions)
                .leftJoin(projects, eq(scheduledSessions.projectIds, projects.id))
                .orderBy(desc(scheduledSessions.date));

            const formatted = allSessions.map((row: any) => ({
                id: row.session.id,
                date: row.session.date,
                startTime: row.session.startTime,
                duration: row.session.durationMinutes,
                focus: row.session.focus,
                notes: row.session.notes,
                isCompleted: row.session.isCompleted,
                projectIds: row.session.projectIds ? JSON.parse(row.session.projectIds) : [],
                type: row.session.type,
            }));

            setSessions(formatted);
        } catch (e) {
            console.error('Failed to fetch sessions', e);
            setSessions([]);
        } finally {
            setIsLoading(false);
        }
    }

    // Convert sessions to calendar events
    const calendarEvents = useMemo(() => {
        return sessions.map(session => ({
            id: session.id,
            date: session.date,
            startTime: session.startTime,
            duration: session.duration,
            title: session.focus || 'Focus Session',
            type: session.type || 'focus',
            isCompleted: session.isCompleted,
        }));
    }, [sessions]);

    // Get events for selected date
    const selectedDateEvents = useMemo(() => {
        if (!selectedDate) return [];
        return sessions.filter(s => s.date === selectedDate);
    }, [sessions, selectedDate]);

    // Get upcoming reminders from inbox
    const upcomingReminders = useMemo(() => {
        return inbox
            .filter((item: any) => item.type === 'reminder' && item.dueDate && !item.isCompleted)
            .map((item: any) => ({
                id: item.id,
                date: item.dueDate,
                startTime: item.dueTime || '09:00',
                duration: 30,
                title: item.content,
                type: 'reminder' as const,
                isCompleted: false,
            }))
            .slice(0, 10);
    }, [inbox]);

    // Combine sessions and reminders for calendar
    const allCalendarEvents = useMemo(() => {
        return [...calendarEvents, ...upcomingReminders];
    }, [calendarEvents, upcomingReminders]);

    const handleGenerateSchedule = async () => {
        // Mock AI schedule generation
        const today = new Date();
        const newSessions = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            if (activeProjects.length > 0 && Math.random() > 0.3) {
                const project = activeProjects[Math.floor(Math.random() * activeProjects.length)];
                const session = {
                    id: Crypto.randomUUID(),
                    userId: null,
                    date: dateStr,
                    startTime: `${9 + Math.floor(Math.random() * 8)}:00 AM`,
                    durationMinutes: [25, 50, 90][Math.floor(Math.random() * 3)],
                    focus: project.title,
                    notes: null,
                    projectIds: JSON.stringify([project.id]),
                    isCompleted: false,
                    type: 'deep_work',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };
                
                await db.insert(scheduledSessions).values(session);
                newSessions.push(session);
            }
        }
        
        await fetchSessions();
        setShowGenerateModal(false);
        toast.success('Schedule generated!');
    };

    const handleComplete = async (id: string) => {
        await db.update(scheduledSessions)
            .set({ isCompleted: true, updatedAt: Date.now() })
            .where(eq(scheduledSessions.id, id));
        await fetchSessions();
        toast.success('Session completed');
    };

    const handleDelete = async (id: string) => {
        await db.delete(scheduledSessions).where(eq(scheduledSessions.id, id));
        await fetchSessions();
        toast.success('Session deleted');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-3">
                        <Calendar className="text-primary size-8" />
                        Schedule
                    </h1>
                    <p className="text-neutral-400">
                        Plan your days with AI-powered scheduling and calendar view
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={cn(
                                "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                                viewMode === 'calendar'
                                    ? "bg-primary/20 text-primary"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            <CalendarDays className="size-4 inline mr-2" />
                            Calendar
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                                viewMode === 'list'
                                    ? "bg-primary/20 text-primary"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            <List className="size-4 inline mr-2" />
                            List
                        </button>
                    </div>
                    <Button
                        onClick={() => setShowGenerateModal(true)}
                        className="bg-primary hover:bg-primary/90 text-white"
                    >
                        <Plus size={20} className="mr-2" />
                        Generate Schedule
                    </Button>
                </div>
            </div>

            {showGenerateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 max-w-md w-full"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Generate Weekly Schedule</h3>
                            <button
                                onClick={() => setShowGenerateModal(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <X className="size-5 text-neutral-400" />
                            </button>
                        </div>
                        <p className="text-neutral-400 mb-6">
                            AI will analyze your active projects and create a weekly schedule optimized for your productivity.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowGenerateModal(false)}
                                variant="ghost"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleGenerateSchedule}
                                className="flex-1 bg-primary hover:bg-primary/90 text-white"
                            >
                                Generate
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-20">
                    <Calendar className="size-12 text-neutral-500 mx-auto mb-4 animate-pulse" />
                    <p className="text-neutral-400">Loading schedule...</p>
                </div>
            ) : viewMode === 'calendar' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar View */}
                    <div className="lg:col-span-2">
                        <CalendarView
                            events={allCalendarEvents}
                            onDateClick={(date) => setSelectedDate(date)}
                            onEventClick={(event) => {
                                // Handle event click
                                toast.info(`Event: ${event.title}`);
                            }}
                        />
                    </div>
                    
                    {/* Selected Date Events */}
                    <div className="space-y-4">
                        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">
                                {selectedDate 
                                    ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                                    : 'Select a date'}
                            </h3>
                            
                            {selectedDate && selectedDateEvents.length === 0 && (
                                <p className="text-neutral-500 text-sm">No events scheduled for this date</p>
                            )}
                            
                            {selectedDateEvents.map((session: any) => (
                                <div key={session.id} className="mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className={cn(
                                                "font-semibold text-sm",
                                                session.isCompleted ? "line-through text-neutral-500" : "text-white"
                                            )}>
                                                {session.focus || 'General Focus'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                                                {session.startTime && (
                                                    <>
                                                        <Clock className="size-3" />
                                                        <span>{session.startTime}</span>
                                                    </>
                                                )}
                                                {session.duration && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{session.duration} min</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {!session.isCompleted && (
                                                <button
                                                    onClick={() => handleComplete(session.id)}
                                                    className="p-1.5 rounded hover:bg-green-500/20 transition-colors"
                                                    title="Mark as complete"
                                                >
                                                    <Check className="size-4 text-green-400" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(session.id)}
                                                className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
                                                title="Delete"
                                            >
                                                <X className="size-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {sessions.length === 0 ? (
                        <div className="text-center py-20 bg-[#1C1C1E] border border-white/10 rounded-xl">
                            <Calendar className="size-12 text-neutral-500 mx-auto mb-4" />
                            <p className="text-xl font-medium text-white mb-2">No scheduled sessions yet</p>
                            <p className="text-neutral-400 mb-6">Generate an AI-powered weekly schedule to get started.</p>
                            <Button
                                onClick={() => setShowGenerateModal(true)}
                                className="bg-primary hover:bg-primary/90 text-white"
                            >
                                Generate Schedule
                            </Button>
                        </div>
                    ) : (
                        sessions.map((session: any) => (
                            <div key={session.id} className={`bg-[#1C1C1E] border border-white/10 rounded-xl p-4 ${session.isCompleted ? 'opacity-60' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`size-12 rounded-lg flex items-center justify-center ${
                                            session.isCompleted ? 'bg-green-500/20' : 'bg-primary/20'
                                        }`}>
                                            <Clock className={`size-6 ${session.isCompleted ? 'text-green-400' : 'text-primary'}`} />
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${session.isCompleted ? 'line-through text-neutral-500' : 'text-white'}`}>
                                                {session.focus || 'General Focus'}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-sm text-neutral-400">
                                                    {session.startTime}
                                                </p>
                                                <span className="text-neutral-600">•</span>
                                                <p className="text-sm text-neutral-400">
                                                    {session.duration} minutes
                                                </p>
                                                <span className="text-neutral-600">•</span>
                                                <p className="text-sm text-neutral-400">
                                                    {new Date(session.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {session.notes && (
                                                <p className="text-xs text-neutral-500 mt-1">{session.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!session.isCompleted && (
                                            <button
                                                onClick={() => handleComplete(session.id)}
                                                className="p-2 rounded-lg hover:bg-green-500/20 transition-colors"
                                                title="Mark as complete"
                                            >
                                                <Check className="size-5 text-green-400" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(session.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                                            title="Delete"
                                        >
                                            <X className="size-5 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
