import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { LoadingState } from "@/components/loading-state";

// Code splitting: Load onboarding wizard dynamically (only shown once per user)
const OnboardingWizard = dynamic(
  () => import("@/components/onboarding-wizard").then((mod) => ({ default: mod.OnboardingWizard })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center p-8">
        <LoadingState type="card" />
      </div>
    ),
    ssr: true,
  }
);

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  // Check if user has completed onboarding
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      projects: { take: 1 },
      areas: { take: 1 },
      weeklyReviews: { take: 1 },
    },
  });

  const hasCompletedOnboarding = (user?.projects.length ?? 0) > 0 || (user?.areas.length ?? 0) > 0;

  if (hasCompletedOnboarding) {
    redirect("/home");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <OnboardingWizard userId={userId} />
      </div>
    </div>
  );
}

