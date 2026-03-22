import { useState, useCallback, useEffect } from 'react';
import { db } from '../database/client';
import { scheduledSessions } from '../database/schema';
import { type ScheduledSession, type NewScheduledSession } from '../types';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { generateUUID } from '../utils/uuid';
import { NotificationService } from '../services/notificationService';

export function useSchedule() {
    const [sessions, setSessions] = useState<ScheduledSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSessions = useCallback(async (startDate?: string, endDate?: string) => {
        setIsLoading(true);
        try {
            let query = db.select().from(scheduledSessions);

            // if date range provided, filter (simple string comparison works for ISO YYYY-MM-DD)
            if (startDate && endDate) {
                // @ts-ignore - complex generic types with where
                query = query.where(
                    and(
                        gte(scheduledSessions.date, startDate),
                        lte(scheduledSessions.date, endDate)
                    )
                );
            }

            // @ts-ignore
            const result = await query.orderBy(desc(scheduledSessions.date), desc(scheduledSessions.createdAt));
            setSessions(result as ScheduledSession[]);
        } catch (e) {
            console.error("Failed to fetch schedule", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addScheduledSession = useCallback(async (
        date: string,
        durationMinutes: number,
        focus: string = 'Deep Work',
        projectIds: string[] = [],
        startTime?: string,
        type?: string
    ) => {
        const now = Date.now();
        const id = generateUUID();

        // Schedule Notification if date is in future
        let notificationId: string | null = null;
        const scheduleDate = new Date(date);

        // If passing YYYY-MM-DD, try to set time from startTime string (HH:MM AM/PM)
        if (date.length === 10 && startTime) {
            const timeParts = startTime.match(/(\d+):(\d+)\s?(AM|PM)/i);
            if (timeParts) {
                let hours = parseInt(timeParts[1]);
                const minutes = parseInt(timeParts[2]);
                const ampm = timeParts[3].toUpperCase();

                if (ampm === 'PM' && hours < 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;

                scheduleDate.setHours(hours, minutes, 0, 0);
            } else {
                scheduleDate.setHours(9, 0, 0, 0);
            }
        } else if (date.length === 10) {
            scheduleDate.setHours(9, 0, 0, 0);
        }

        if (scheduleDate.getTime() > now) {
            notificationId = await NotificationService.schedulePracticeReminder(
                scheduleDate,
                "Focus Session Scheduled",
                `Focus: ${focus} for ${durationMinutes} mins`
            );
        }

        const newSession: NewScheduledSession = {
            id,
            date,
            durationMinutes,
            focus,
            projectIds: JSON.stringify(projectIds),
            isCompleted: false,
            notificationId: notificationId || undefined,
            startTime: startTime || null,
            type: type || null,
            createdAt: now,
            updatedAt: now,
        };

        await db.insert(scheduledSessions).values(newSession);

        // actually return it so UI can update locally
        setSessions(prev => [newSession as ScheduledSession, ...prev]);

        return newSession;
    }, []);

    const toggleComplete = useCallback(async (id: string, isCompleted: boolean) => {
        const now = Date.now();
        await db.update(scheduledSessions)
            .set({ isCompleted, updatedAt: now })
            .where(eq(scheduledSessions.id, id));

        setSessions(prev => prev.map(s => s.id === id ? { ...s, isCompleted, updatedAt: now } : s));
    }, []);

    const deleteScheduledSession = useCallback(async (id: string, notificationId?: string | null) => {
        if (notificationId) {
            await NotificationService.cancelReminder(notificationId);
        }
        await db.delete(scheduledSessions).where(eq(scheduledSessions.id, id));
        setSessions(prev => prev.filter(s => s.id !== id));
    }, []);

    const updateScheduledSession = useCallback(async (id: string, updates: Partial<{ focus: string; durationMinutes: number; date: string }>) => {
        const now = Date.now();
        await db.update(scheduledSessions)
            .set({ ...updates, updatedAt: now })
            .where(eq(scheduledSessions.id, id));

        setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: now } : s));
    }, []);

    return {
        sessions,
        isLoading,
        fetchSessions,
        addScheduledSession,
        updateScheduledSession,
        toggleComplete,
        deleteScheduledSession
    };
}
