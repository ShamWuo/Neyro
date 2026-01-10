import { prisma } from "@/lib/prisma";
import { getUserSubscription } from "./subscription";

/**
 * Track AI credit usage and check limits
 */
export async function trackAICredit(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription || !subscription.isActive) {
    // Free tier - check monthly limit
    const limit = 50; // Free tier limit
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    // TODO: When AI credit tracking model is added to schema, implement:
    // const usage = await prisma.aiCreditUsage.count({
    //   where: {
    //     userId,
    //     usedAt: { gte: currentMonth },
    //   },
    // });
    
    // For now, return mock data until schema is updated
    const usage = 0; // Placeholder
    
    return {
      allowed: usage < limit,
      remaining: Math.max(0, limit - usage),
      limit,
    };
  }
  
  // Paid tier - unlimited
  if (subscription.limits.maxAiCredits === -1) {
    return {
      allowed: true,
      remaining: -1, // unlimited
      limit: -1,
    };
  }
  
  // For other paid tiers with limits (shouldn't happen currently)
  return {
    allowed: true,
    remaining: subscription.limits.maxAiCredits,
    limit: subscription.limits.maxAiCredits,
  };
}

/**
 * Record AI credit usage (call after successful AI operation)
 */
export async function recordAICreditUsage(userId: string): Promise<void> {
  // TODO: When AI credit tracking model is added to schema, implement:
  // await prisma.aiCreditUsage.create({
  //   data: {
  //     userId,
  //     usedAt: new Date(),
  //   },
  // });
  
  // For now, just log - schema update needed for full tracking
  console.log(`AI credit used by user ${userId} at ${new Date().toISOString()}`);
}

/**
 * Get AI credit usage for current month
 */
export async function getAICreditUsage(userId: string): Promise<{ used: number; limit: number; remaining: number }> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription || !subscription.isActive) {
    const limit = 50;
    
    // TODO: When AI credit tracking model is added:
    // const currentMonth = new Date();
    // currentMonth.setDate(1);
    // currentMonth.setHours(0, 0, 0, 0);
    // const used = await prisma.aiCreditUsage.count({
    //   where: {
    //     userId,
    //     usedAt: { gte: currentMonth },
    //   },
    // });
    
    const used = 0; // Placeholder
    
    return {
      used,
      limit,
      remaining: Math.max(0, limit - used),
    };
  }
  
  if (subscription.limits.maxAiCredits === -1) {
    return {
      used: 0,
      limit: -1,
      remaining: -1,
    };
  }
  
  return {
    used: 0,
    limit: subscription.limits.maxAiCredits,
    remaining: subscription.limits.maxAiCredits,
  };
}
