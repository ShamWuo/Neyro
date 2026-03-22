import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { eq } from 'drizzle-orm';
import { db } from '../database/client';
import { settings as settingsSchema } from '../database/schema';
import type { Settings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const SETTINGS_KEY = 'app_settings';

interface SettingsContextType {
    settings: Settings;
    isLoading: boolean;
    error: Error | null;
    updateSettings: (updates: Partial<Settings>) => Promise<void>;
    setDailyGoal: (minutes: number) => Promise<void>;
    setTheme: (theme: Settings['theme']) => Promise<void>;
    setCalendarSync: (enabled: boolean) => Promise<void>;
    refetch: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<Settings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchSettings = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await db
                .select()
                .from(settingsSchema)
                .where(eq(settingsSchema.key, SETTINGS_KEY));

            if (result.length > 0) {
                const parsed = JSON.parse(result[0].value) as Settings;
                setData({ ...DEFAULT_SETTINGS, ...parsed });
            } else {
                setData(DEFAULT_SETTINGS);
            }
            setError(null);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to fetch settings';
            // On web, database is not available - use default settings
            if (errorMessage.includes('web') || errorMessage.includes('not available')) {
                setData(DEFAULT_SETTINGS);
                setError(null); // Don't show error on web
            } else {
                setError(new Error(errorMessage));
                setData(DEFAULT_SETTINGS);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateSettings = useCallback(async (updates: Partial<Settings>): Promise<void> => {
        try {
            const newSettings = { ...data, ...updates };
            const value = JSON.stringify(newSettings);

            // Check if settings exist
            const existing = await db
                .select()
                .from(settingsSchema)
                .where(eq(settingsSchema.key, SETTINGS_KEY));

            if (existing.length > 0) {
                await db
                    .update(settingsSchema)
                    .set({ value })
                    .where(eq(settingsSchema.key, SETTINGS_KEY));
            } else {
                await db.insert(settingsSchema).values({ key: SETTINGS_KEY, value });
            }

            setData(newSettings);
        } catch (e) {
            throw e instanceof Error ? e : new Error('Failed to update settings');
        }
    }, [data]);

    const setDailyGoal = useCallback(async (minutes: number): Promise<void> => {
        await updateSettings({ dailyGoalMinutes: Math.max(1, Math.min(480, minutes)) });
    }, [updateSettings]);

    const setTheme = useCallback(async (theme: Settings['theme']): Promise<void> => {
        await updateSettings({ theme });
    }, [updateSettings]);

    const setCalendarSync = useCallback(async (enabled: boolean): Promise<void> => {
        await updateSettings({ calendarSync: enabled });
    }, [updateSettings]);

    const value = {
        settings: data,
        isLoading,
        error,
        updateSettings,
        setDailyGoal,
        setTheme,
        setCalendarSync,
        refetch: fetchSettings,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

// Fallback mechanism to prevent crashes if Provider is missing (e.g. during specific test or odd routing states)
const DUMMY_CONTEXT: SettingsContextType = {
    settings: DEFAULT_SETTINGS,
    isLoading: false,
    error: new Error('SettingsProvider missing'),
    updateSettings: async () => console.warn('SettingsProvider missing'),
    setDailyGoal: async () => console.warn('SettingsProvider missing'),
    setTheme: async () => console.warn('SettingsProvider missing'),
    setCalendarSync: async () => console.warn('SettingsProvider missing'),
    refetch: async () => { },
};

export function useSettingsContext() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        // Log error but return dummy to prevent crash
        console.error('CRITICAL: useSettingsContext called outside SettingsProvider. Check your app/_layout.tsx.');
        return DUMMY_CONTEXT;
    }
    return context;
}
