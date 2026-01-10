import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserSubscription } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BillingSettings } from "@/components/billing-settings";

export const metadata = {
  title: "Billing Settings",
  description: "Manage your subscription and billing",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; canceled?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const params = await searchParams;
  const subscription = await getUserSubscription(session.user.id);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Billing & Subscription</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Manage your subscription, payment methods, and billing history.
        </p>
      </div>

      {params?.success === "true" && (
        <div className="mb-6 rounded-md border border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,var(--surface))] px-4 py-3 text-sm text-[var(--success)]">
          ✅ Subscription activated successfully!
        </div>
      )}

      {params?.canceled === "true" && (
        <div className="mb-6 rounded-md border border-[var(--border-default)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          Checkout was canceled. You can try again anytime.
        </div>
      )}

      <BillingSettings subscription={subscription} userId={session.user.id} />
    </div>
  );
}
