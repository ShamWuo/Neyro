import { db } from '../database/client'; // Corrected import based on file exploration
import { classificationHistory, userPreferences, UserPreference, NewUserPreference, NewClassificationHistory } from '../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { ClassificationResult } from './classifierService';

export const AdaptiveAIService = {
    /**
     * Records a user's interaction with an AI suggestion to learn from it.
     */
    learnFromCorrection: async (
        userId: string,
        originalContent: string,
        aiSuggestion: ClassificationResult,
        userAction: 'accepted' | 'corrected' | 'rejected',
        finalDestination?: string,
        finalTargetId?: string,
        finalTargetName?: string // Useful to store for pattern matching
    ) => {
        try {
            // 1. Log the history
            const historyEntry: NewClassificationHistory = {
                id: crypto.randomUUID(),
                userId,
                originalContent,
                aiSuggestion: JSON.stringify(aiSuggestion),
                userAction,
                correctionType: userAction === 'corrected'
                    ? (finalDestination !== aiSuggestion.suggestedDestination ? 'destination' : 'project')
                    : null,
                finalDestination: finalDestination || aiSuggestion.suggestedDestination,
                finalTargetId: finalTargetId || aiSuggestion.suggestedTargetId,
                timestamp: Date.now(),
            };

            await db.insert(classificationHistory).values(historyEntry);

            // 2. If corrected, try to learn a pattern immediately (Auto-Learning)
            // Simple heuristic: If user corrects "Email Dave" to "Project A" twice, verify pattern.
            // For now, we'll just log it. A background job or smarter logic would aggregate these.
            if (userAction === 'corrected' && finalTargetId) {
                await AdaptiveAIService.attemptPatternLearning(userId, originalContent, finalDestination, finalTargetId, finalTargetName);
            }

        } catch (error) {
            console.error('[AdaptiveAI] Failed to learn from correction:', error);
        }
    },

    /**
     * Simple pattern extractor.
     * Checks if multiple recent corrections exist for similar keywords.
     */
    attemptPatternLearning: async (userId: string, content: string, destination: string | undefined, targetId: string, targetName?: string) => {
        // This is a simplified version. In a real app, you'd use TF-IDF or more complex NLP stats.
        // For now, look for exact keyword matches in recent history.
    },

    /**
     * Retrieve active negative constraints for the user
     */
    getNegativeConstraints: async (userId: string): Promise<UserPreference[]> => {
        try {
            if (!db || !db.query || !db.query.userPreferences) {
                console.warn('Database not available for getNegativeConstraints');
                return [];
            }
            return await db.query.userPreferences.findMany({
                where: and(
                    eq(userPreferences.userId, userId),
                    eq(userPreferences.type, 'negative_constraint'),
                    eq(userPreferences.isEnabled, true)
                )
            });
        } catch (error) {
            console.error('[AdaptiveAI] Failed to get constraints:', error);
            return [];
        }
    },

    /**
     * Retrieve style mirroring preferences (e.g., "always move X to Y")
     */
    getStyleMirrors: async (userId: string): Promise<UserPreference[]> => {
        try {
            if (!db || !db.query || !db.query.userPreferences) {
                console.warn('Database not available for getStyleMirrors');
                return [];
            }
            return await db.query.userPreferences.findMany({
                where: and(
                    eq(userPreferences.userId, userId),
                    eq(userPreferences.type, 'style_mirror'),
                    eq(userPreferences.isEnabled, true)
                )
            });
        } catch (error) {
            console.error('[AdaptiveAI] Failed to get style mirrors:', error);
            return [];
        }
    },

    /**
     * Adds a new negative constraint manually
     */
    addNegativeConstraint: async (userId: string, pattern: string, description: string) => {
        const newPref: NewUserPreference = {
            id: crypto.randomUUID(),
            userId,
            type: 'negative_constraint',
            pattern,
            action: JSON.stringify({ type: 'block', reason: description }),
            confidence: 100, // User manually added it
            isEnabled: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        await db.insert(userPreferences).values(newPref);
    },

    /**
     * Determines if an item should be auto-sorted based on confidence and user settings.
     */
    shouldAutoSort: async (userId: string, classification: ClassificationResult): Promise<boolean> => {
        // In a real implementation, we'd fetch the user's specific threshold setting.
        // For now, let's assume a default high bar.
        const AUTO_SORT_THRESHOLD = 0.9;

        // Also check if user has globally enabled auto-sort (mocked check)
        const isAutoSortEnabled = true; // Replace with settings fetch

        return isAutoSortEnabled && (classification.confidence >= AUTO_SORT_THRESHOLD);
    }
};
