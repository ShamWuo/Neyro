import { db } from '../database/client';
import { tasks, focusSessions } from '../database/schema';
import { eq, and, gte } from 'drizzle-orm';

// Area Health Utilities
// Calculate dynamic health scores based on real activity

export interface AreaHealthMetrics {
    tasksCompletedThisWeek: number;
    totalTasks: number;
    focusMinutesThisWeek: number;
    daysSinceLastActivity: number;
    healthScore: number; // 1-5 scale
    trend: 'improving' | 'stable' | 'declining';
    message: string;
}

export const calculateAreaHealth = async (
    areaId: string,
    lastReviewedAt?: number | null
): Promise<AreaHealthMetrics> => {
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Fetch tasks for this area
    const areaTasks = await db
        .select()
        .from(tasks)
        .where(and(
            eq(tasks.parentType, 'area'),
            eq(tasks.parentId, areaId)
        ));

    const totalTasks = areaTasks.length;
    const tasksCompletedThisWeek = areaTasks.filter(
        (t: any) => t.completedAt && t.completedAt >= oneWeekAgo
    ).length;

    // Fetch focus sessions for this area (if focusArea field matches)
    const areaFocusSessions = await db
        .select()
        .from(focusSessions)
        .where(and(
            eq(focusSessions.focusArea, areaId),
            gte(focusSessions.completedAt, oneWeekAgo)
        ));

    const focusMinutesThisWeek = areaFocusSessions.reduce(
        (sum: number, session: any) => sum + session.durationMinutes,
        0
    );

    // Calculate days since last activity
    const lastTaskActivity = Math.max(
        ...areaTasks.map((t: any) => t.updatedAt || 0),
        ...areaFocusSessions.map((s: any) => s.completedAt || 0),
        0
    );
    const daysSinceLastActivity = lastTaskActivity > 0
        ? Math.floor((now - lastTaskActivity) / (1000 * 60 * 60 * 24))
        : 999; // No activity ever

    // Calculate health score (1-5)
    let healthScore = 3; // Default: neutral

    // Positive factors
    if (tasksCompletedThisWeek >= 3) healthScore += 1;
    if (focusMinutesThisWeek >= 60) healthScore += 1; // 1+ hour of focus

    // Negative factors (neglect penalty)
    if (daysSinceLastActivity >= 14) healthScore -= 2; // 2 weeks
    else if (daysSinceLastActivity >= 7) healthScore -= 1; // 1 week

    // Clamp to 1-5
    healthScore = Math.max(1, Math.min(5, healthScore));

    // Determine trend (compare to last review if available)
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    // For now, simple heuristic: if score is 4-5, improving; 1-2, declining
    if (healthScore >= 4) trend = 'improving';
    else if (healthScore <= 2) trend = 'declining';

    // Generate message
    let message = '';
    if (healthScore === 5) {
        message = `Thriving! ${tasksCompletedThisWeek} tasks completed, ${focusMinutesThisWeek}min focused`;
    } else if (healthScore === 4) {
        message = `Healthy. ${tasksCompletedThisWeek} tasks this week`;
    } else if (healthScore === 3) {
        message = daysSinceLastActivity > 0
            ? `Stable. Last activity ${daysSinceLastActivity}d ago`
            : 'Stable';
    } else if (healthScore === 2) {
        message = `Slipping. ${daysSinceLastActivity} days since activity`;
    } else {
        message = `Neglected. No activity in ${daysSinceLastActivity}+ days`;
    }

    return {
        tasksCompletedThisWeek,
        totalTasks,
        focusMinutesThisWeek,
        daysSinceLastActivity,
        healthScore,
        trend,
        message
    };
};

export const getHealthScoreColor = (score: number): string => {
    if (score >= 4) return '#10b981'; // green
    if (score === 3) return '#3b82f6'; // blue
    if (score === 2) return '#f59e0b'; // amber
    return '#ef4444'; // red
};

export const getHealthScoreIcon = (score: number): string => {
    if (score >= 4) return 'heart';
    if (score === 3) return 'pulse';
    if (score === 2) return 'alert-circle';
    return 'warning';
};
