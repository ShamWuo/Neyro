import { SyncService } from '../SyncService';
import { supabase } from '../../lib/supabase';
import { db } from '../../database/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ------------------------------------------------------------------
// Mocks
// ------------------------------------------------------------------

// 1. Mock Supabase Client
jest.mock('../../lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                gt: jest.fn().mockResolvedValue({ data: [], error: null }), // Direct gt
                eq: jest.fn(() => ({
                    gt: jest.fn().mockResolvedValue({ data: [], error: null }), // eq -> gt
                })),
            })),
            upsert: jest.fn().mockResolvedValue({ error: null }),
        })),
    },
}));

// Mock Native Modules (Dependencies of Supabase/DB)
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

jest.mock('expo-sqlite', () => ({
    openDatabaseSync: jest.fn(),
}));

// 2. Mock Local Database (Drizzle)
jest.mock('../../database/client', () => ({
    db: {
        insert: jest.fn(() => ({
            values: jest.fn(() => ({
                onConflictDoUpdate: jest.fn().mockResolvedValue(true),
            })),
        })),
        select: jest.fn(() => ({
            from: jest.fn(() => ({
                where: jest.fn().mockResolvedValue([]), // Default empty
            })),
        })),
    },
}));

// 3. Mock Async Storage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
}));

describe('SyncService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('sync()', () => {
        it('should skip sync if user is not logged in', async () => {
            (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({ data: { session: null } });

            await SyncService.sync();

            expect(supabase.from).not.toHaveBeenCalled();
        });

        it('should perform pull and push when user is logged in', async () => {
            // Setup User
            (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
                data: { session: { user: { id: 'test-user-id' } } }
            });

            // Setup Last Sync Time
            (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('2024-01-01T00:00:00.000Z');

            // Setup Pull Data (Changes from Cloud)
            const mockCloudData = [{ id: '1', title: 'Cloud Project', updated_at: 123456789 }];

            // Mock the Supabase query chain properly
            const mockGt = jest.fn().mockResolvedValue({ data: mockCloudData, error: null });
            const mockSelect = jest.fn(() => ({ gt: mockGt }));
            const mockUpsert = jest.fn().mockResolvedValue({ error: null });

            (supabase.from as jest.Mock).mockReturnValue({
                select: mockSelect,
                upsert: mockUpsert
            });

            // Run Sync
            await SyncService.sync();

            // Verify that sync attempted to query tables
            expect(supabase.from).toHaveBeenCalled();
            expect(mockSelect).toHaveBeenCalled();
        });

        it('should push local changes to cloud', async () => {
            // Setup User
            (supabase.auth.getSession as jest.Mock).mockResolvedValue({
                data: { session: { user: { id: 'test-user-id' } } }
            });

            // Setup Local Data (Dirty items)
            const mockLocalData = [{ id: '2', title: 'Local Task', updatedAt: Date.now() }];
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn(() => ({
                    where: jest.fn().mockResolvedValue(mockLocalData)
                }))
            });

            // Mock Upsert
            const mockUpsert = jest.fn().mockResolvedValue({ error: null });
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn(() => ({
                    gt: jest.fn().mockResolvedValue({ data: [] }), // Direct gt for pull
                    eq: jest.fn(() => ({ gt: jest.fn().mockResolvedValue({ data: [] }) }))
                })),
                upsert: mockUpsert
            });

            await SyncService.sync();

            // Verify Push
            expect(mockUpsert).toHaveBeenCalled();
        });
    });
});
