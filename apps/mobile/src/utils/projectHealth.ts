// Project Health Utilities
// Calculate health metrics for projects to prevent scope creep

export interface ProjectHealth {
    isStale: boolean;
    daysSinceActivity: number;
    daysUntilDeadline: number | null;
    healthScore: 'excellent' | 'good' | 'warning' | 'critical';
    message?: string;
}

export const calculateProjectHealth = (
    updatedAt: number,
    deadline?: string | null,
    completedAt?: number | null
): ProjectHealth => {
    const now = Date.now();
    const daysSinceActivity = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));

    let daysUntilDeadline: number | null = null;
    if (deadline) {
        const deadlineDate = new Date(deadline).getTime();
        daysUntilDeadline = Math.floor((deadlineDate - now) / (1000 * 60 * 60 * 24));
    }

    // Determine staleness (no activity in 7+ days)
    const isStale = daysSinceActivity >= 7;

    // Calculate health score
    let healthScore: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
    let message: string | undefined;

    if (completedAt) {
        healthScore = 'excellent';
        message = 'Completed';
    } else if (isStale) {
        healthScore = 'critical';
        message = `No activity in ${daysSinceActivity} days`;
    } else if (daysUntilDeadline !== null && daysUntilDeadline < 0) {
        healthScore = 'critical';
        message = `Overdue by ${Math.abs(daysUntilDeadline)} days`;
    } else if (daysUntilDeadline !== null && daysUntilDeadline <= 3) {
        healthScore = 'warning';
        message = `Due in ${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''}`;
    } else if (daysSinceActivity >= 3) {
        healthScore = 'warning';
        message = `${daysSinceActivity} days since last update`;
    } else {
        healthScore = 'good';
        message = daysSinceActivity === 0 ? 'Active today' : `Active ${daysSinceActivity} day${daysSinceActivity !== 1 ? 's' : ''} ago`;
    }

    return {
        isStale,
        daysSinceActivity,
        daysUntilDeadline,
        healthScore,
        message
    };
};

export const getHealthColor = (score: 'excellent' | 'good' | 'warning' | 'critical'): string => {
    switch (score) {
        case 'excellent': return '#10b981'; // green
        case 'good': return '#3b82f6'; // blue
        case 'warning': return '#f59e0b'; // amber
        case 'critical': return '#ef4444'; // red
    }
};
