import { useState, useEffect, useCallback } from 'react';
import { eq, desc } from 'drizzle-orm';
import { db } from '../database/client';
import { focusSessions, projects } from '../database/schema';
import type { FocusSession, NewFocusSession, Project } from '../types';
import { generateUUID } from '../utils/uuid';
import { getDateKey, formatDate } from '../utils/formatters';
import { supabase } from '../lib/supabase';

// Helper to update XP
async function updateUserXP(durationMinutes: number) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 10 XP per minute
    const xpEarned = durationMinutes * 10;
    if (xpEarned <= 0) return;

    const { data: profile } = await supabase.from('User').select('xp').eq('id', user.id).single();
    if (profile) {
      const newXp = (profile.xp || 0) + xpEarned;
      await supabase.from('User').update({ xp: newXp }).eq('id', user.id);
    }
  } catch (e) {
    console.error('Failed to sync XP:', e);
  }
}

export function useSessions() {
  const [data, setData] = useState<FocusSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await db
        .select()
        .from(focusSessions)
        .orderBy(desc(focusSessions.date), desc(focusSessions.completedAt));
      setData(result as FocusSession[]);
      setError(null);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch sessions';
      if (errorMessage.includes('web') || errorMessage.includes('not available')) {
        setData([]);
        setError(null);
      } else {
        setError(new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const logFocusSession = useCallback(async (
    projectId: string | null,
    durationMinutes: number,
    notes: string | null,
    focusArea: string | null,
    date: string // YYYY-MM-DD
  ): Promise<FocusSession> => {
    const now = Date.now();

    const newSession: NewFocusSession = {
      id: generateUUID(),
      projectId,
      durationMinutes,
      date,
      notes,
      focusArea,
      completedAt: now,
      updatedAt: now,
    };

    await db.insert(focusSessions).values(newSession);
    await fetchSessions(); // Refresh the list

    // Sync XP
    updateUserXP(durationMinutes);

    return newSession as FocusSession;
  }, [fetchSessions]);

  const deleteSession = useCallback(async (id: string): Promise<void> => {
    await db.delete(focusSessions).where(eq(focusSessions.id, id));
    await fetchSessions();
  }, [fetchSessions]);

  const getSessionsForProject = useCallback(async (projectId: string): Promise<FocusSession[]> => {
    const result = await db
      .select()
      .from(focusSessions)
      .where(eq(focusSessions.projectId, projectId))
      .orderBy(desc(focusSessions.date));
    return result as FocusSession[];
  }, []);

  return {
    sessions: data,
    isLoading,
    error,
    logFocusSession,
    deleteSession,
    getSessionsForProject,
    refetch: fetchSessions,
  };
}

export interface FocusSessionWithProject extends FocusSession {
  project: Project | null;
}

/**
 * Hook to get sessions with project data attached
 */
export function useSessionsWithProjects() {
  const [data, setData] = useState<FocusSessionWithProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const result = await db
        .select({
          session: focusSessions,
          project: projects,
        })
        .from(focusSessions)
        .leftJoin(projects, eq(focusSessions.projectId, projects.id))
        .orderBy(desc(focusSessions.date), desc(focusSessions.completedAt));

      const joined: FocusSessionWithProject[] = result.map((row: any) => ({
        ...row.session,
        project: row.project,
      }));

      setData(joined);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch sessions'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    sessions: data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

