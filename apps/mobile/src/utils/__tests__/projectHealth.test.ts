import { calculateProjectHealth, getHealthColor } from '../projectHealth';

describe('Project Health Utilities', () => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = now - (10 * 24 * 60 * 60 * 1000);

    describe('calculateProjectHealth', () => {
        it('should mark project as good if active today', () => {
            const health = calculateProjectHealth(now);
            expect(health.healthScore).toBe('good');
            expect(health.isStale).toBe(false);
            expect(health.daysSinceActivity).toBe(0);
            expect(health.message).toBe('Active today');
        });

        it('should mark project as good if active 1 day ago', () => {
            const health = calculateProjectHealth(oneDayAgo);
            expect(health.healthScore).toBe('good');
            expect(health.isStale).toBe(false);
        });

        it('should mark project as warning if 3-6 days inactive', () => {
            const health = calculateProjectHealth(threeDaysAgo);
            expect(health.healthScore).toBe('warning');
            expect(health.isStale).toBe(false);
        });

        it('should mark project as stale if 7+ days inactive', () => {
            const health = calculateProjectHealth(sevenDaysAgo);
            expect(health.isStale).toBe(true);
            expect(health.healthScore).toBe('critical');
            expect(health.daysSinceActivity).toBeGreaterThanOrEqual(7);
        });

        it('should mark project as critical if 10+ days inactive', () => {
            const health = calculateProjectHealth(tenDaysAgo);
            expect(health.isStale).toBe(true);
            expect(health.healthScore).toBe('critical');
            expect(health.message).toContain('No activity');
        });

        it('should handle deadline warnings', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const health = calculateProjectHealth(oneDayAgo, tomorrow.toISOString());

            expect(health.healthScore).toBe('warning');
            expect(health.daysUntilDeadline).toBeGreaterThanOrEqual(0);
            expect(health.daysUntilDeadline).toBeLessThanOrEqual(1);
            expect(health.message).toContain('Due in');
        });

        it('should mark overdue projects as critical', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const health = calculateProjectHealth(oneDayAgo, yesterday.toISOString());

            expect(health.healthScore).toBe('critical');
            expect(health.daysUntilDeadline).toBeLessThan(0);
            expect(health.message).toContain('Overdue');
        });

        it('should mark completed projects as excellent', () => {
            const health = calculateProjectHealth(tenDaysAgo, null, now);
            expect(health.healthScore).toBe('excellent');
            expect(health.message).toBe('Completed');
        });
    });

    describe('getHealthColor', () => {
        it('should return green for excellent', () => {
            expect(getHealthColor('excellent')).toBe('#10b981');
        });

        it('should return blue for good', () => {
            expect(getHealthColor('good')).toBe('#3b82f6');
        });

        it('should return amber for warning', () => {
            expect(getHealthColor('warning')).toBe('#f59e0b');
        });

        it('should return red for critical', () => {
            expect(getHealthColor('critical')).toBe('#ef4444');
        });
    });
});
