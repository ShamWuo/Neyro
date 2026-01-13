import { logger } from "./logger";

/**
 * Track AI credit usage and check limits
 */
export async function trackAICredit(_userId: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  // Simplified for V1: Hardcoded limit for everyone
  const limit = 50;

  // TODO: Implement actual tracking
  const usage = 0;

  return {
    allowed: usage < limit,
    remaining: Math.max(0, limit - usage),
    limit,
  };
}

/**
 * Record AI credit usage (call after successful AI operation)
 */
export async function recordAICreditUsage(userId: string): Promise<void> {
  // For now, just log
  logger.info(`AI credit used by user ${userId} at ${new Date().toISOString()}`);
}

/**
 * Get AI credit usage for current month
 */
export async function getAICreditUsage(_userId: string): Promise<{ used: number; limit: number; remaining: number }> {
  const limit = 50;
  const used = 0; // Placeholder

  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}
