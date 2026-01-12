
import { prisma } from "@/lib/prisma";

export const FREE_LIMITS = {
    maxProjects: 3,
    maxAreas: 4,
    maxResources: 10,
};

export const PRO_LIMITS = {
    maxProjects: 200,
    maxAreas: 200,
    maxResources: 1000,
};

type LimitType = keyof typeof FREE_LIMITS;

export async function checkSubscriptionLimit(userId: string, limitType: LimitType) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true },
    });

    const isPro = user?.subscriptionTier === "FOCUS" || user?.subscriptionTier === "BRAIN_TRUST";
    const limit = isPro ? PRO_LIMITS[limitType] : FREE_LIMITS[limitType];

    let count = 0;
    if (limitType === "maxProjects") {
        count = await prisma.project.count({ where: { userId, status: "ACTIVE", archivedAt: null } });
    } else if (limitType === "maxAreas") {
        count = await prisma.area.count({ where: { userId, archivedAt: null } });
    } else if (limitType === "maxResources") {
        count = await prisma.resourceCollection.count({ where: { userId, archivedAt: null } });
    }

    return {
        allowed: count < limit,
        limit,
        isPro,
        count,
    };
}

export async function canAccessFeature(userId: string, feature: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true },
    });

    const isPro = user?.subscriptionTier === "FOCUS" || user?.subscriptionTier === "BRAIN_TRUST";

    if (feature === "exports") return isPro;
    if (feature === "ai-credits") return true; // Everyone gets some AI credits?

    return false;
}
