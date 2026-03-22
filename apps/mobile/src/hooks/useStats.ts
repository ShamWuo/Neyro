import { useMemo } from 'react';
import { useSessions } from './useSessions';
import { useProjects } from './useProjects';
import { useSettings } from './useSettings';
import { calculateStats, calculateMostActiveProject } from '../services/statsService';
import type { FocusStats } from '../types';

/**
 * Hook to get computed practice statistics
 */
export function useStats(): {
  stats: FocusStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { sessions, isLoading: sessionsLoading, error: sessionsError, refetch: refetchSessions } = useSessions();
  const { projects, isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects();
  const { settings, isLoading: settingsLoading } = useSettings();

  const stats = useMemo(() => {
    if (sessionsLoading || projectsLoading || settingsLoading) return null;
    return calculateStats(sessions, projects, settings.dailyGoalMinutes);
  }, [sessions, projects, settings.dailyGoalMinutes, sessionsLoading, projectsLoading, settingsLoading]);

  const isLoading = sessionsLoading || projectsLoading || settingsLoading;
  // @ts-ignore
  const error = sessionsError || projectsError;

  const refetch = () => {
    refetchSessions();
    refetchProjects();
  };

  return { stats, isLoading, error, refetch };
}

