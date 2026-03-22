'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { SyncService } from '@mobile/services/SyncService';
import { useNeyroStore } from '@mobile/store/useNeyroStore';

interface SyncContextType {
    isSyncing: boolean;
    lastSyncTime: Date | null;
    syncNow: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType>({
    isSyncing: false,
    lastSyncTime: null,
    syncNow: async () => { },
});

export const useSync = () => useContext(SyncContext);

export function SyncProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    // @ts-ignore
    const loadData = useNeyroStore((state: any) => state.loadData);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

    const syncNow = React.useCallback(async () => {
        if (!user || isSyncing) return;

        setIsSyncing(true);
        try {
            console.log('[SyncProvider] Triggering Sync...');
            await SyncService.sync();
            setLastSyncTime(new Date());

            // Reload local data after sync to reflect changes
            await loadData();
        } catch (error) {
            console.error('[SyncProvider] Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    }, [user, isSyncing, loadData]);

    // Auto-sync on mount and user change
    useEffect(() => {
        if (user) {
            syncNow();

            // Optional: Periodic sync every 2 minutes
            const interval = setInterval(syncNow, 2 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [user, syncNow]);

    // Listen for visibility change (sync when tab becomes active)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user) {
                syncNow();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [user, syncNow]);

    return (
        <SyncContext.Provider value={{ isSyncing, lastSyncTime, syncNow }}>
            {children}
        </SyncContext.Provider>
    );
}
