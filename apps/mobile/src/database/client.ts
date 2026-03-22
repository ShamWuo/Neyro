import { Platform } from 'react-native';
import * as schema from './schema';

// Database name
const DATABASE_NAME = 'neyro.db';

// Platform-specific imports - expo-sqlite doesn't work on web
let SQLite: typeof import('expo-sqlite') | null = null;
let drizzle: typeof import('drizzle-orm/expo-sqlite').drizzle | null = null;

const isWeb = Platform.OS === 'web' || typeof window !== 'undefined' && !global.expo;

// Only import expo-sqlite on native platforms
if (!isWeb) {
  try {
    SQLite = require('expo-sqlite');
    drizzle = require('drizzle-orm/expo-sqlite').drizzle;
  } catch (error) {
    console.warn('[DB] Failed to load expo-sqlite:', error);
  }
}

// Create the SQLite database connection
let expo: any = null;
let dbInstance: any = null;

// Initialize database connection (lazy initialization for web compatibility)
function getDatabase() {
  if (isWeb) {
    throw new Error('Database not available on web platform. Use native iOS/Android app.');
  }

  if (!SQLite) {
    throw new Error('expo-sqlite is not available');
  }

  if (!expo) {
    try {
      expo = SQLite.openDatabaseSync(DATABASE_NAME);
    } catch (error) {
      console.error('[DB] Failed to open database:', error);
      throw error;
    }
  }
  return expo;
}

// Web storage using sessionStorage
const WEB_SESSION_STORAGE_KEY = 'neyro_web_session_data';

function getWebStorage() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = sessionStorage.getItem(WEB_SESSION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { pieces: [], sessions: [], settings: [], projects: [], areas: [], resources: [], inbox_items: [], tasks: [], notes: [] };
  } catch(error) {
    console.error('[Mock DB] getWebStorage - parse error:', error);
    return { pieces: [], sessions: [], settings: [], projects: [], areas: [], resources: [], inbox_items: [], tasks: [], notes: [] };
  }
}

function saveWebStorage(data: any) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.setItem(WEB_SESSION_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[DB] Failed to save to sessionStorage:', error);
  }
}

const getTableName = (table: any): string => {
  if (table?._?.name) return table._.name; // Drizzle table name
  if (table?.name) return table.name;
  return 'unknown_table';
};


function getDb() {
  if (isWeb) {
    // Mock DB Helper: Basic Query support
    const executeSelect = (tableName: string, whereFn: any) => {
      const storage = getWebStorage();
      let data = storage[tableName] || [];

      if (whereFn) {
        // Heuristic to parse Drizzle 'eq' condition
        const findEqualityCondition = (obj: any): { field: string, value: any } | null => {
            if (obj && typeof obj === 'object' && obj.$operator === 'eq' && obj.left && obj.right) {
                // Drizzle eq typically looks like { $operator: 'eq', left: { ...column }, right: { value: '...' } }
                const fieldName = obj.left.column?.name; // Access column name from Drizzle's column object
                const value = obj.right.value;
                if (fieldName && value !== undefined) {
                    return { field: fieldName, value: value };
                }
            } else if (obj && typeof obj === 'object' && obj.chunks) {
                // If it's an array of chunks, try to find an eq condition within them
                for (const chunk of obj.chunks) {
                    const eqCondition = findEqualityCondition(chunk);
                    if (eqCondition) return eqCondition;
                }
            }
            return null;
        };

        const eqCondition = findEqualityCondition(whereFn);

        if (eqCondition) {
            data = data.filter((item: any) => item[eqCondition.field] === eqCondition.value);
        }
      }
      
      return data;
    };


    return {
      select: () => ({
        from: (table: any) => {
          const tableName = getTableName(table);
          const queryBuilder = {
            where: (whereFn: any) => {
               // We ignore WHERE for select, returning all data. 
               // This works because the Store also consistently filters active/paused lists from the returned set.
               // However, `inbox` might show processed items. 
               // Improvement: implement client-side filter in the Store for Web if needed. 
               // Or hope `whereFn` isn't critical purely for security/hidden data.
              const resultFn = () => Promise.resolve(executeSelect(tableName, whereFn));
              return {
                orderBy: () => Promise.resolve(executeSelect(tableName, whereFn)),
                then: (resolve: any) => resultFn().then(resolve)
              }
            },
            orderBy: () => Promise.resolve(executeSelect(tableName, null)),
            leftJoin: () => queryBuilder, 
            then: (resolve: any) => Promise.resolve(executeSelect(tableName, null)).then(resolve),
            get: () => Promise.resolve(executeSelect(tableName, null)[0]), // Mock .get()
          };
          return queryBuilder;
        },
      }),
      insert: (table: any) => ({
        values: (values: any | any[]) => {
          const tableName = getTableName(table);
          const itemsToInsert = Array.isArray(values) ? values : [values];

          const execute = async (config?: any) => {
            const storage = getWebStorage();
            const existing = storage[tableName] || [];
            const now = Date.now();

            const processedItems = itemsToInsert.map((item: any) => ({
              ...item,
              createdAt: item.createdAt || now,
              updatedAt: item.updatedAt || now,
            }));

            let newStorageData = [...existing];

            if (config && config.onConflictDoUpdate) {
               // Handle Upsert
               const target = config.onConflictDoUpdate.target; // Drizzle column object
               // Assume ID check
               for (const newItem of processedItems) {
                   const idx = newStorageData.findIndex((row: any) => row.id === newItem.id);
                   if (idx >= 0) {
                        newStorageData[idx] = { ...newStorageData[idx], ...newItem, ...config.onConflictDoUpdate.set };
                   } else {
                       newStorageData.push(newItem);
                   }
               }
            } else {
               newStorageData = [...existing, ...processedItems];
            }

            storage[tableName] = newStorageData;
            saveWebStorage(storage);
            return processedItems; 
          };

          const builder = {
            onConflictDoUpdate: (config: any) => {
                return {
                     returning: () => builder,
                     then: (resolve: any) => execute({ onConflictDoUpdate: config }).then(resolve)
                }
            },
            returning: () => builder,
            then: (resolve: any) => execute().then(resolve)
          };
          return builder;
        },
      }),
      update: (table: any) => ({
        set: (updates: any) => ({
          where: async (whereFn: any) => {
            const tableName = getTableName(table);
            const storage = getWebStorage();
            const items = storage[tableName] || [];

            const findEqualityCondition = (obj: any): { field: string, value: any } | null => {
                if (obj && typeof obj === 'object' && obj.$operator === 'eq' && obj.left && obj.right) {
                    const fieldName = obj.left.column?.name;
                    const value = obj.right.value;
                    if (fieldName && value !== undefined) {
                        return { field: fieldName, value: value };
                    }
                } else if (obj && typeof obj === 'object' && obj.chunks) {
                    for (const chunk of obj.chunks) {
                        const eqCondition = findEqualityCondition(chunk);
                        if (eqCondition) return eqCondition;
                    }
                }
                return null;
            };
            
            const eqCondition = findEqualityCondition(whereFn);
            
            const updatedItems = items.map((item: any) => {
              if (eqCondition && item[eqCondition.field] === eqCondition.value) {
                return { ...item, ...updates, updatedAt: Date.now() };
              }
              return item;
            });

            storage[tableName] = updatedItems;
            saveWebStorage(storage);
            return Promise.resolve();
          },
        }),
      }),
      delete: (table: any) => ({
        where: async (whereFn: any) => {
          const tableName = getTableName(table);
          const storage = getWebStorage();
          let items = storage[tableName] || [];

          const findEqualityCondition = (obj: any): { field: string, value: any } | null => {
            if (obj && typeof obj === 'object' && obj.$operator === 'eq' && obj.left && obj.right) {
                const fieldName = obj.left.column?.name;
                const value = obj.right.value;
                if (fieldName && value !== undefined) {
                    return { field: fieldName, value: value };
                }
            } else if (obj && typeof obj === 'object' && obj.chunks) {
                for (const chunk of obj.chunks) {
                    const eqCondition = findEqualityCondition(chunk);
                    if (eqCondition) return eqCondition;
                }
            }
            return null;
          };
            
          const eqCondition = findEqualityCondition(whereFn);

          if (eqCondition && eqCondition.field === 'id') {
            items = items.filter((i: any) => i.id !== eqCondition.value);
            storage[tableName] = items;
            saveWebStorage(storage);
          }
          return Promise.resolve();
        },
      }),
    };
  }

  if (!dbInstance) {
    const dbConnection = getDatabase();
    if (!dbConnection) {
      throw new Error('Database connection not available');
    }
    if (!drizzle) {
      throw new Error('drizzle is not available');
    }
    try {
      dbInstance = drizzle(dbConnection, { schema });
    } catch (error) {
      console.error('[DB] Failed to create Drizzle instance:', error);
      throw error;
    }
  }
  return dbInstance;
}

// Export db with lazy initialization using a getter
export const db = new Proxy({} as any, {
  get(target, prop) {
    const database = getDb();
    const value = database[prop as keyof typeof database];
    if (typeof value === 'function') {
      return value.bind(database);
    }
    return value;
  }
});

export async function initializeDatabase(): Promise<void> {
  if (isWeb) {
    return;
  }

  try {
    if (!expo) {
      if (!SQLite) {
        return;
      }
      try {
        expo = SQLite.openDatabaseSync(DATABASE_NAME);
      } catch (error) {
        console.error('[DB] Failed to open database:', error);
        throw error;
      }
    }

    if (!dbInstance && expo) {
      if (!drizzle) return;
      try {
        dbInstance = drizzle(expo, { schema });
      } catch (error) {
        console.error('[DB] Failed to create Drizzle instance:', error);
        throw error;
      }
    }
    
    if (!expo) return;

    // Run Migrations
    const { runMigrations } = require('./migrations');
    await runMigrations(expo);

  } catch (error) {
    console.error('[DB] Error initializing database:', error);
  }
}

export { expo as sqliteDb };
