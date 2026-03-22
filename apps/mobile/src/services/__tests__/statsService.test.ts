import { calculateStreaks } from '../statsService';
import type { FocusSession } from '../../types';

describe('statsService', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    describe('calculateStreaks', () => {
        it('should return 0 for empty sessions', () => {
            const { currentStreak, longestStreak } = calculateStreaks([]);
            expect(currentStreak).toBe(0);
            expect(longestStreak).toBe(0);
        });

        it('should return 1 for a session today', () => {
            const today = new Date();
            today.setHours(12, 0, 0, 0);

            const sessions: FocusSession[] = [{
                id: '1',
                projectId: 'p1',
                date: today.toISOString().split('T')[0],
                durationMinutes: 60,
                notes: null,
                completedAt: today.getTime() + 3600000,
                userId: 'u1',
                focusArea: null,
                updatedAt: Date.now()
            }];

            const { currentStreak } = calculateStreaks(sessions);
            expect(currentStreak).toBe(1);
        });

        it('should return 0 if last session was more than 1 day ago', () => {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            twoDaysAgo.setHours(12, 0, 0, 0);

            const sessions: FocusSession[] = [{
                id: '1',
                projectId: 'p1',
                date: twoDaysAgo.toISOString().split('T')[0],
                durationMinutes: 60,
                notes: null,
                completedAt: twoDaysAgo.getTime() + 3600000,
                userId: 'u1',
                focusArea: null,
                updatedAt: Date.now()
            }];

            const { currentStreak } = calculateStreaks(sessions);
            expect(currentStreak).toBe(0);
        });

        it('should calculate consecutive days correctly', () => {
            const sessions: FocusSession[] = [];
            const today = new Date();

            // Create sessions for the last 5 days
            for (let i = 0; i < 5; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                date.setHours(12, 0, 0, 0);

                sessions.push({
                    id: `session-${i}`,
                    projectId: 'p1',
                    date: date.toISOString().split('T')[0],
                    durationMinutes: 60,
                    notes: null,
                    completedAt: date.getTime() + 3600000,
                    userId: 'u1',
                    focusArea: null,
                    updatedAt: Date.now()
                });
            }

            const { currentStreak } = calculateStreaks(sessions);
            expect(currentStreak).toBe(5);
        });
    });

    describe('calculateStreaks - longest streak', () => {
        it('should return 1 for a single session', () => {
            const today = new Date();
            const sessions: FocusSession[] = [{
                id: '1',
                projectId: 'p1',
                date: today.toISOString().split('T')[0],
                durationMinutes: 60,
                notes: null,
                completedAt: today.getTime() + 3600000,
                userId: 'u1',
                focusArea: null,
                updatedAt: Date.now()
            }];

            const { longestStreak } = calculateStreaks(sessions);
            expect(longestStreak).toBe(1);
        });

        it('should find the longest streak among multiple streaks', () => {
            const sessions: FocusSession[] = [];
            const baseDate = new Date('2024-01-01');

            // First streak: 3 days (Jan 1-3)
            for (let i = 0; i < 3; i++) {
                const date = new Date(baseDate);
                date.setDate(date.getDate() + i);
                sessions.push({
                    id: `session-${i}`,
                    projectId: 'p1',
                    date: date.toISOString().split('T')[0],
                    durationMinutes: 60,
                    notes: null,
                    completedAt: date.getTime() + 3600000,
                    userId: 'u1',
                    focusArea: null,
                    updatedAt: Date.now()
                });
            }

            // Gap of 2 days

            // Second streak: 5 days (Jan 6-10) - this should be the longest
            for (let i = 5; i < 10; i++) {
                const date = new Date(baseDate);
                date.setDate(date.getDate() + i);
                sessions.push({
                    id: `session-${i}`,
                    projectId: 'p1',
                    date: date.toISOString().split('T')[0],
                    durationMinutes: 60,
                    notes: null,
                    completedAt: date.getTime() + 3600000,
                    userId: 'u1',
                    focusArea: null,
                    updatedAt: Date.now()
                });
            }

            const { longestStreak } = calculateStreaks(sessions);
            expect(longestStreak).toBe(5);
        });
    });
});
