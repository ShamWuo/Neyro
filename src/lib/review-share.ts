import { prisma } from "./prisma";
import crypto from "crypto";

export async function generateShareToken(reviewId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  
  await prisma.weeklyReview.update({
    where: { id: reviewId },
    data: { shareToken: token, sharedAt: new Date() },
  });

  return token;
}

export async function getSharedReview(token: string) {
  return prisma.weeklyReview.findUnique({
    where: { shareToken: token },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

