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
    const [todayActions, setTodayActions] = useState<TodayAction[]>([]);
    // @ts-ignore
    const inbox = useNeyroStore((state: any) => state.inbox || []);
    // @ts-ignore
    const activeProjects = useNeyroStore((state: any) => state.activeProjects || []);
    // @ts-ignore
    const tasks = useNeyroStore((state: any) => state.tasks || []);

    useEffect(() => {
        // Load from localStorage
        const saved = localStorage.getItem('neyro_today_list');
        if (saved) {
            try {
                setTodayActions(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load today list:', e);
            }
        }
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
