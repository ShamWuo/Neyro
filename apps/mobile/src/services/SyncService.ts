import { supabase } from '../lib/supabase';
import { db } from '../database/client';
import {
    projects, areas, resources,
    inboxItems, tasks, notes,
    focusSessions, scheduledSessions
} from '../database/schema';
import { eq, gt, and } from 'drizzle-orm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const LAST_SYNC_KEY = 'neyro_last_sync_timestamp';

// Map of Drizzle Tables
const SYNC_TABLES = [
    { name: 'projects', table: projects },
    { name: 'areas', table: areas },
    { name: 'resources', table: resources },
    { name: 'inbox_items', table: inboxItems },
    { name: 'tasks', table: tasks },
    { name: 'notes', table: notes },
    { name: 'focus_sessions', table: focusSessions },
    { name: 'scheduled_sessions', table: scheduledSessions }
];

export const SyncService = {
    async sync() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.log('[Sync] No active session. Skipping sync.');
                return;
            }

            const userId = session.user.id;
            const lastSyncStr = await AsyncStorage.getItem(LAST_SYNC_KEY);
            const lastSync = lastSyncStr ? parseInt(lastSyncStr) : 0;
            const now = Date.now();

            console.log(`[Sync] Starting sync... Last sync: ${new Date(lastSync).toLocaleString()}`);

            for (const { name, table } of SYNC_TABLES) {
                await this.syncTable(name, table, lastSync, userId);
            }

            await AsyncStorage.setItem(LAST_SYNC_KEY, now.toString());
            console.log('[Sync] Sync complete.');
        } catch (error) {
            console.error('[Sync] Sync failed:', error);
        }
    },

    async syncTable(tableName: string, tableObj: any, lastSync: number, userId: string) {
        // 1. PUSH: Get local items updated since last sync AND belong to user (or unassigned/null if we claim them)
        // Note: For now, we assume local items created while logged in have userId. 
        // Items created anonymously might need migration, but for now we skip that complexity.

        let localChanges;

        if (Platform.OS === 'web') {
            // Web Mock DB doesn't support 'gt' or complex queries.
            // Fetch ALL items and filter in memory.
            const allItems = await db.select().from(tableObj);
            localChanges = allItems.filter((item: any) => item.updatedAt > lastSync);
        } else {
            // Native SQLite supports SQL queries
            try {
                localChanges = await db.select()
                    .from(tableObj)
                    .where(gt(tableObj.updatedAt, lastSync));
            } catch (e) {
                localChanges = [];
            }
        }

        if (localChanges.length > 0) {
            console.log(`[Sync] Pushing ${localChanges.length} changes for ${tableName}`);

            const rowsToUpsert = localChanges.map((row: any) => ({
                ...row,
                // Ensure snake_case for Supabase if Drizzle uses camelCase automatically?
                // Drizzle queries return column names as defined in schema keys.
                // Our schema keys are camelCase, but we defined columns with snake_case names in sqliteTable?
                // Actually Drizzle sqliteTable definitions usually map cleanly. 
                // However, Supabase (Postgres) expects snake_case columns.
                // We might need to transform keys if our Drizzle schema object keys != DB columns.
                // BUT, Supabase JS client takes object keys matching DB columns.
                // Let's assume our local schema keys match remote column names logic or Drizzle returns the underlying DB column names?
                // No, Drizzle select return objects with keys = schema property names (camelCase).
                // So we MUST map camelCase keys to snake_case for Supabase.

                user_id: userId // Ensure ownership is stamped
            }));

            // We need a helper to convert keys to snake_case
            const snakeCaseRows = rowsToUpsert.map(toSnakeCase);

            const { error } = await supabase
                .from(tableName)
                .upsert(snakeCaseRows);

            if (error) console.error(`[Sync] Push error details for ${tableName}:`, error);
        }

        // 2. PULL: Get remote items updated since last sync
        const { data: remoteChanges, error: pullError } = await supabase
            .from(tableName)
            .select('*')
            .gt('updated_at', lastSync); // Supabase uses ms or ISO? Postgres is usually ISO or check migration. 
        // Our migration says bigint for updated_at. So integer comparison works.

        if (pullError) {
            console.error(`[Sync] Pull error for ${tableName}:`, pullError);
            return;
        }

        if (remoteChanges && remoteChanges.length > 0) {
            console.log(`[Sync] Pulling ${remoteChanges.length} changes for ${tableName}`);

            // Upsert to local SQLite
            // Map back snake_case to match Drizzle insert structure if needed?
            // Drizzle insert takes the schema object shape.
            const camelCaseRows = remoteChanges.map(toCamelCase);

            for (const row of camelCaseRows) {
                await db.insert(tableObj)
                    .values(row)
                    .onConflictDoUpdate({
                        target: tableObj.id,
                        set: row
                    });
            }
        }
    }
};

// Helpers for Case Conversion (Simple implementation based on our known schema)
function toSnakeCase(obj: any) {
    const newObj: any = {};
    for (const key in obj) {
        const newKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        newObj[newKey] = obj[key];
    }
    // Specific overrides if auto-conversion fails specific named columns? 
    // e.g. isCompleted -> is_completed works.
    // userId -> user_id works.
    return newObj;
}

function toCamelCase(obj: any) {
    const newObj: any = {};
    for (const key in obj) {
        const newKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        newObj[newKey] = obj[key];
    }
    return newObj;
}
