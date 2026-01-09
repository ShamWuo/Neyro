import { prisma } from "./prisma";

export async function generateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.referralCode) return user.referralCode;

  // Generate a unique referral code
  let code: string;
  let exists = true;
  while (exists) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    exists = !!existing;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
  });

  return code!;
}

export async function trackReferral(referrerId: string, referredEmail: string) {
  return prisma.referral.upsert({
    where: {
      referrerId_referredEmail: {
        referrerId,
        referredEmail,
      },
    },
    create: {
      referrerId,
      referredEmail,
      status: "pending",
    },
    update: {},
  });
}

export async function markReferralConverted(referredEmail: string) {
  const referral = await prisma.referral.findFirst({
    where: { referredEmail, status: "pending" },
  });

  if (referral) {
    await prisma.referral.update({
      where: { id: referral.id },
      data: { status: "converted", convertedAt: new Date() },
    });

    await prisma.user.update({
      where: { id: referral.referrerId },
      data: { referralCount: { increment: 1 } },
    });
  }
}

