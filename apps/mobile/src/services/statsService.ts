import type { FocusSession, Project, FocusStats, DayFocus } from '../types';
import { getDateKey, getStartOfDay, getStartOfWeek, getLastNDays } from '../utils/formatters';

/**
 * Calculate all practice statistics from sessions
 */
export function calculateStats(
  sessions: FocusSession[],
  projects: Project[],
  dailyGoalMinutes: number
): FocusStats {
  const now = Date.now();
  const todayStart = getStartOfDay(now);
  const weekStart = getStartOfWeek(now);

  // Total minutes calculations
  const totalMinutesAllTime = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalMinutesThisWeek = sessions
    .filter((s) => s.completedAt >= weekStart)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalMinutesToday = sessions
    .filter((s) => s.completedAt >= todayStart)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  // Streaks
  const { currentStreak, longestStreak } = calculateStreaks(sessions);

  // Most active project
  const mostActiveProject = calculateMostActiveProject(sessions, projects);

  // Daily goal progress (0-100)
  const dailyGoalProgress = Math.min(
    100,
    Math.round((totalMinutesToday / dailyGoalMinutes) * 100)
  );

  // Focus by day (last 7 days)
  const focusByDay = calculateFocusByDay(sessions, 7);

  return {
    totalMinutesAllTime,
    totalMinutesThisWeek,
    totalMinutesToday,
    currentStreak,
    longestStreak,
    mostActiveProject,
    dailyGoalProgress,
    focusByDay,
  };
}

/**
 * Calculate current and longest focus streaks
 */
export function calculateStreaks(sessions: FocusSession[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Get unique practice days
  const practiceDays = new Set<string>();
  sessions.forEach((session) => {
    practiceDays.add(session.date); // session.date is already YYYY-MM-DD
  });

  const sortedDays = Array.from(practiceDays).sort().reverse();

  // Calculate current streak
  let currentStreak = 0;
  const today = getDateKey(Date.now());
  const yesterday = getDateKey(Date.now() - 24 * 60 * 60 * 1000);

  // Current streak must start from today or yesterday
  if (sortedDays[0] === today || sortedDays[0] === yesterday) {
    currentStreak = 1;

    for (let i = 1; i < sortedDays.length; i++) {
      const currentDate = new Date(sortedDays[i - 1] + 'T00:00:00');
      const prevDate = new Date(sortedDays[i] + 'T00:00:00');
      const diffDays = Math.round(
        (currentDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  const sortedDaysAsc = Array.from(practiceDays).sort();

  for (let i = 1; i < sortedDaysAsc.length; i++) {
    const prevDate = new Date(sortedDaysAsc[i - 1] + 'T00:00:00');
    const currentDate = new Date(sortedDaysAsc[i] + 'T00:00:00');
    const diffDays = Math.round(
      (currentDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}

/**
 * Find the most active project
 */
export function calculateMostActiveProject(
  sessions: FocusSession[],
  projects: Project[]
): { project: Project; minutes: number } | null {
  if (sessions.length === 0 || projects.length === 0) {
    return null;
  }

  // Sum duration by project
  const durationByProject: Record<string, number> = {};
  sessions.forEach((session) => {
    if (session.projectId) {
      durationByProject[session.projectId] =
        (durationByProject[session.projectId] || 0) + session.durationMinutes;
    }
  });

  // Find max
  let maxProjectId: string | null = null;
  let maxDuration = 0;

  Object.entries(durationByProject).forEach(([id, duration]) => {
    if (duration > maxDuration) {
      maxDuration = duration;
      maxProjectId = id;
    }
  });

  if (!maxProjectId) return null;

  const project = projects.find((p) => p.id === maxProjectId);
  if (!project) return null;

  return {
    project,
    minutes: maxDuration,
  };
}

/**
 * Calculate focus minutes by day for last N days
 */
export function calculateFocusByDay(sessions: FocusSession[], days: number): DayFocus[] {
  const dayKeys = getLastNDays(days);

  // Sum duration by day
  const durationByDay: Record<string, number> = {};
  sessions.forEach((session) => {
    const day = session.date;
    if (dayKeys.includes(day)) {
      durationByDay[day] = (durationByDay[day] || 0) + session.durationMinutes;
    }
  });

  return dayKeys.map((date) => ({
    date,
    minutes: durationByDay[date] || 0,
  }));
}

