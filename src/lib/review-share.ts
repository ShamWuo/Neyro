
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function generateShareToken(reviewId: string): Promise<string> {
    const token = randomBytes(32).toString("hex");

    await prisma.weeklyReview.update({
        where: { id: reviewId },
        data: {
            shareToken: token,
            sharedAt: new Date(),
        },
    });

    return token;
}

export async function getSharedReview(tokenOrId: string) {
    // Try to find by token first
    const byToken = await prisma.weeklyReview.findUnique({
        where: { shareToken: tokenOrId },
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
    });

    if (byToken) return byToken;

    // Fallback: Try by ID
    const byId = await prisma.weeklyReview.findUnique({
        where: { id: tokenOrId },
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
    });

    return byId;
}
