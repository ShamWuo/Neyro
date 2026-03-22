'use client';

import { useState, useEffect } from 'react';
import { useNeyroStore } from '@mobile/store/useNeyroStore';

export interface TodayAction {
    id: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    timeEstimate: number; // minutes
    energyLevel: 'low' | 'medium' | 'high';
    sourceType: 'inbox' | 'project' | 'task';
    sourceId: string;
    dueDate?: string;
    tags?: string[];
}

export function useTodayList() {
    const [todayActions, setTodayActions] = useState<TodayAction[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('neyro_today_list');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to load today list:', e);
                }
            }
        }
        return [];
    });

    useEffect(() => {
        // This effect is currently only for logging or other sync tasks if needed, 
        // but we'll leave it empty or remove it if not used.
    }, []);

    const addToToday = (action: TodayAction) => {
        const updated = [...todayActions, action];
        setTodayActions(updated);
        localStorage.setItem('neyro_today_list', JSON.stringify(updated));
    };

    const removeFromToday = (id: string) => {
        const updated = todayActions.filter(a => a.id !== id);
        setTodayActions(updated);
        localStorage.setItem('neyro_today_list', JSON.stringify(updated));
    };

    const clearToday = () => {
        setTodayActions([]);
        localStorage.removeItem('neyro_today_list');
    };

    return {
        todayActions,
        addToToday,
        removeFromToday,
        clearToday,
    };
}
