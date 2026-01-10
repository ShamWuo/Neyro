import { prisma } from "@/lib/prisma";
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";

export const SUBSCRIPTION_LIMITS = {
  FREE: {
    maxProjects: 3,
    maxAiCredits: 50, // per month
    exports: false,
    templates: false,
    calendarSync: false,
    teamFeatures: false,
  },
  FOCUS: {
    maxProjects: 7,
    maxAiCredits: -1, // unlimited
    exports: true,
    templates: true,
    calendarSync: true,
    teamFeatures: false,
  },
  BRAIN_TRUST: {
    maxProjects: 7,
    maxAiCredits: -1,
    exports: true,
    templates: true,
    calendarSync: true,
    teamFeatures: true,
  },
} as const;

export async function getUserSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
      subscriptionCancelAtPeriodEnd: true,
      trialEndsAt: true,
    },
  });

  if (!user) {
    return null;
  }

  const isActive =
    user.subscriptionStatus === SubscriptionStatus.ACTIVE ||
    user.subscriptionStatus === SubscriptionStatus.TRIALING;

  const isTrial = user.subscriptionStatus === SubscriptionStatus.TRIALING && 
                  user.trialEndsAt && 
                  new Date() < user.trialEndsAt;

  return {
    tier: user.subscriptionTier,
    status: user.subscriptionStatus,
    isActive,
    isTrial,
    currentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    cancelAtPeriodEnd: user.subscriptionCancelAtPeriodEnd,
    trialEndsAt: user.trialEndsAt,
    limits: SUBSCRIPTION_LIMITS[user.subscriptionTier],
  };
}

export async function checkSubscriptionLimit(
  userId: string,
  limitType: keyof typeof SUBSCRIPTION_LIMITS.FREE
): Promise<{ allowed: boolean; limit: number; current?: number }> {
  const subscription = await getUserSubscription(userId);
  if (!subscription || !subscription.isActive) {
    return {
      allowed: false,
      limit: SUBSCRIPTION_LIMITS.FREE[limitType] as number,
    };
  }

  const limit = subscription.limits[limitType] as number;

  // Check current usage for projects
  if (limitType === "maxProjects") {
    const currentProjects = await prisma.project.count({
      where: {
        userId,
        status: "ACTIVE",
        archivedAt: null,
      },
    });

    return {
      allowed: currentProjects < limit,
      limit,
      current: currentProjects,
    };
  }

  // For other limits, just return the limit
  return {
    allowed: limit === -1 || limit > 0, // -1 means unlimited
    limit,
  };
}

export async function canAccessFeature(
  userId: string,
  feature: "exports" | "templates" | "calendarSync" | "teamFeatures"
): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (!subscription || !subscription.isActive) {
    return false;
  }

  return subscription.limits[feature] === true;
}

export async function startTrial(userId: string, tier: "FOCUS" | "BRAIN_TRUST") {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14-day trial

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: SubscriptionStatus.TRIALING,
      trialEndsAt,
    },
  });

  return trialEndsAt;
}
