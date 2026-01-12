import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/referral";
import { ReferralDashboard } from "@/components/referral-dashboard";

export const metadata = {
  title: "Referrals",
  description: "Invite friends and earn rewards",
};

export default async function ReferralsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      referralCode: true,
      referralCount: true,
      referredBy: true,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Ensure user has a referral code
  const referralCode = user.referralCode || (await generateReferralCode(session.user.id));

  const referrals = await prisma.referral.findMany({
    where: { referrerId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Referrals</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Invite friends and both of you get 1 month free on Focus.
        </p>
      </div>

      <ReferralDashboard
        referralCode={referralCode}
        referralCount={user.referralCount}
        referrals={referrals.map((r) => ({
          email: r.referredEmail,
          status: r.status,
          createdAt: r.createdAt,
          convertedAt: r.convertedAt,
        }))}
      />
    </div>
  );
}
