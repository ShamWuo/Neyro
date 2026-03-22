import { db } from '../database/client';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';

export type SubscriptionTier = 'free' | 'musician' | 'virtuoso';

interface PlanDetails {
    id: SubscriptionTier;
    name: string;
    price: string;
    dailyLimit: number; // -1 for unlimited
    features: string[];
    color: string;
}

export const PLANS: Record<SubscriptionTier, PlanDetails> = {
    free: {
        id: 'free',
        name: 'Free',
        price: 'Free',
        dailyLimit: 3, // Monthly actually, but logic handled in code
        features: ['Basic Practice Tracking', 'Metronome & Tuner', '3 AI Credits / Lifetime'],
        color: '#6B7280'
    },
    musician: {
        id: 'musician',
        name: 'Musician',
        price: '$6.99/mo',
        dailyLimit: 50,
        features: ['50 AI Credits / Day', 'Advanced Stats', 'Unlimited Audio Recording'],
        color: '#8B5CF6'
    },
    virtuoso: {
        id: 'virtuoso',
        name: 'Virtuoso',
        price: '$19.00/mo',
        dailyLimit: -1,
        features: ['Unlimited AI Usage', 'Priority Support', 'Early Access Features'],
        color: '#F59E0B'
    }
};

export class SubscriptionService {
    async getUserSubscription(userId: string): Promise<{ tier: SubscriptionTier, usage: number, limit: number }> {
        const user = await db.select().from(users).where(eq(users.id, userId)).get();
        if (!user) throw new Error('User not found');

        const tier = (user.subscriptionTier as SubscriptionTier) || 'free';
        const usage = user.aiUsageCount || 0;
        const plan = PLANS[tier];

        // For Free tier, it's a lifetime/monthly limit treated simply as a hard cap for this MVP
        // User requested "one use... maybe 2 or 3" for free users.
        // We implemented 3 credits TOTAL for free users in this logic based on request interpretation.

        return {
            tier,
            usage,
            limit: plan.dailyLimit
        };
    }

    async checkAiAccess(userId: string): Promise<{ allowed: boolean, reason?: string }> {
        const { tier, usage, limit } = await this.getUserSubscription(userId);

        if (tier === 'virtuoso') return { allowed: true };

        // Logic for Free tier (Lifetime limit of 3 for simplicity as requested "one use... maybe 2 or 3")
        // If we wanted monthly, we'd need to check reset time. 
        // For MVP of "just one usage", simple counter is safest.
        if (tier === 'free') {
            if (usage >= 3) {
                return { allowed: false, reason: 'Free tier limit reached. Upgrade to Musician for more.' };
            }
        }

        // Logic for Musician tier (Daily limit)
        if (tier === 'musician') {
            // We need to check if we should reset usage based on day
            // This simple check assumes usage is reset by a cron or check-on-access.
            // Let's implement check-on-access reset logic here.
            const user = await db.select().from(users).where(eq(users.id, userId)).get();
            const lastReset = user?.aiLimitReset || 0;
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;

            if (now - lastReset > oneDay) {
                // Reset needed
                await db.update(users).set({ aiUsageCount: 0, aiLimitReset: now }).where(eq(users.id, userId));
                return { allowed: true };
            }

            if (usage >= limit) {
                return { allowed: false, reason: 'Daily limit reached. Come back tomorrow or upgrade to Virtuoso.' };
            }
        }

        return { allowed: true };
    }

    async incrementAiUsage(userId: string): Promise<void> {
        const user = await db.select().from(users).where(eq(users.id, userId)).get();
        if (!user) return;

        // Initialize reset timer if 0 (first use)
        if (!user.aiLimitReset) {
            await db.update(users).set({ aiLimitReset: Date.now() }).where(eq(users.id, userId));
        }

        await db.update(users)
            .set({ aiUsageCount: (user.aiUsageCount || 0) + 1 })
            .where(eq(users.id, userId));
    }

    async upgradePlan(userId: string, tier: SubscriptionTier): Promise<void> {
        await db.update(users).set({ subscriptionTier: tier }).where(eq(users.id, userId));
    }
}

export const subscriptionService = new SubscriptionService();
