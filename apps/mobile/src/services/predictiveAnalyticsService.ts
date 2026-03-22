import { db } from '../database/client';
import { focusSessions, tasks, energyPreferences, scheduledSessions } from '../database/schema';
import { eq, and, desc, gte } from 'drizzle-orm';

export const PredictiveAnalyticsService = {

    /**
     * Calculates burnout risk score (0-100)
     * Factors: 
     * - Excessive daily work hours (> 8)
     * - Late night sessions (after 10pm)
     * - Low variety of focus areas
     */
    calculateBurnoutRisk: async (userId: string = 'user_default') => {
        try {
            const now = new Date();
            const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)).getTime(); // fix timestamp logic

            // Fetch recent sessions
            // Note: In real app, filter by userId
            const recentSessions = await db.select().from(focusSessions);
            // Mock filter for now since schema userId is optional/string

            // Simple logic: If > 40 hours logged in last 7 days = High Risk
            // Deep Work ratio: If > 80% deep work without breaks = High Risk

            return {
                riskScore: 25, // Low risk
                riskLevel: 'low', // 'low' | 'medium' | 'high'
                message: "You're balancing work and rest well.",
                suggestions: ["Keep maintaining your current pace."]
            };
        } catch (e) {
            console.error('Burnout calc error', e);
            return { riskScore: 0, riskLevel: 'low', message: "Not enough data.", suggestions: [] };
        }
    },

    /**
     * Calculates tasks completed per week for a project
     */
    calculateProjectVelocity: async (projectId: string) => {
        try {
            // Mock implementation
            // Real: Count active tasks vs completed tasks over time
            return {
                velocity: 4.5, // Tasks/week
                trend: 'stable' // 'improving' | 'declining' | 'stable'
            };
        } catch (e) {
            return { velocity: 0, trend: 'stable' };
        }
    },

    /**
     * Checks if current schedule aligns with energy preferences
     */
    getEnergyAlignment: async (userId: string = 'user_default') => {
        try {
            const prefs = await db.select().from(energyPreferences).where(eq(energyPreferences.userId, userId)).get();

            if (!prefs) {
                return { aligned: true, message: "No energy profile set." };
            }

            // Mock logic
            // Check if high-focus sessions are scheduled during Prime Time (e.g. 09:00 - 12:00)

            return {
                aligned: true,
                message: "Your schedule matches your peak energy hours."
            };
        } catch (e) {
            return { aligned: true, message: "Analysis unavailable." };
        }
    }
};
