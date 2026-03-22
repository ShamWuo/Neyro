
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { projects, areas, resources, tasks, notes, inboxItems, settings, focusSessions, scheduledSessions } from '../database/schema';

// ============================================
// CORE TYPES FOR NEYRO
// ============================================

// Database entities
export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;

export type Area = InferSelectModel<typeof areas>;
export type NewArea = InferInsertModel<typeof areas>;

export type Resource = InferSelectModel<typeof resources>;
export type NewResource = InferInsertModel<typeof resources>;

export type Task = InferSelectModel<typeof tasks>;
export type NewTask = InferInsertModel<typeof tasks>;

export type Note = InferSelectModel<typeof notes>;
export type NewNote = InferInsertModel<typeof notes>;

export type InboxItem = InferSelectModel<typeof inboxItems>;
export type NewInboxItem = InferInsertModel<typeof inboxItems>;


// User settings
export type Setting = InferSelectModel<typeof settings>;

export interface Settings {
  dailyGoalMinutes: number;
  theme: 'light' | 'dark' | 'system';
  defaultView: 'inbox' | 'projects';
  calendarSync: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  dailyGoalMinutes: 60,
  theme: 'light',
  defaultView: 'inbox',
  calendarSync: false,
};

// ============================================
// FORM TYPES
// ============================================

export interface ProjectFormData {
  title: string;
  description?: string;
  deadline?: string;
  outcome?: string;
}

// ============================================
// STATS TYPES
// ============================================

export interface FocusStats {
  totalMinutesAllTime: number;
  totalMinutesThisWeek: number;
  totalMinutesToday: number;
  currentStreak: number;
  longestStreak: number;
  mostActiveProject: { project: Project; minutes: number } | null;
  dailyGoalProgress: number; // 0-100 percentage
  focusByDay: DayFocus[];
}

export interface DayFocus {
  date: string; // YYYY-MM-DD
  minutes: number;
}


// ============================================
// TIMER TYPES
// ============================================

// ============================================
// TIMER TYPES
// ============================================

export type TimerStatus = 'idle' | 'running' | 'paused' | 'stopped';

export interface TimerState {
  status: TimerStatus;
  startTime: number | null;  // Unix timestamp when timer started
  elapsed: number;           // Elapsed seconds
  selectedProjectId: string | null;
}

// Database entity: A single focus session
export type FocusSession = InferSelectModel<typeof focusSessions>;
export type NewFocusSession = InferInsertModel<typeof focusSessions>;

// Database entity: A scheduled session (Planner)
export type ScheduledSession = InferSelectModel<typeof scheduledSessions>;
export type NewScheduledSession = InferInsertModel<typeof scheduledSessions>;

