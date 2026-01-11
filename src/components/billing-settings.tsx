"use client";

import { useState } from "react";
import { getUserSubscription } from "@/lib/subscription";

interface BillingSettingsProps {
  subscription: Awaited<ReturnType<typeof getUserSubscription>>;
}

export function BillingSettings({ subscription }: BillingSettingsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (tier: "FOCUS" | "BRAIN_TRUST", billingCycle: "monthly" | "yearly" = "monthly") => {
    setLoading(`${tier}-${billingCycle}`);
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, billingCycle }),
      });

      const data = await response.json();
      if (data.url) {
        if (typeof window !== "undefined" && window.location) {
          window.location.href = data.url;
        }
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Failed to start checkout. Please try again.");
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading("manage");
    try {
      const response = await fetch("/api/stripe/manage-subscription", {
        method: "POST",
      });

      const data = await response.json();
      if (data.url) {
        // Use window.location.assign for better testability
        if (typeof window !== "undefined" && window.location) {
          try {
            window.location.href = data.url;
          } catch {
            // Fallback for test environments
            window.location.assign(data.url);
          }
        }
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error) {
      console.error("Error opening portal:", error);
      alert("Failed to open billing portal. Please try again.");
      setLoading(null);
    }
  };

  if (!subscription) {
    return (
      <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--text-secondary)]">Loading subscription information...</p>
      </div>
    );
  }

  const isFree = subscription.tier === "FREE";
  const isActive = subscription.isActive;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Current Plan</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {subscription.tier === "FREE" && "Free tier - Upgrade to unlock more features"}
              {subscription.tier === "FOCUS" && "Focus - Full PARA enforcement"}
              {subscription.tier === "BRAIN_TRUST" && "Brain Trust - For teams"}
            </p>
            {subscription.isTrial && subscription.trialEndsAt && (
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                Trial ends {new Date(subscription.trialEndsAt).toLocaleDateString()}
              </p>
            )}
            {subscription.currentPeriodEnd && (
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                {subscription.cancelAtPeriodEnd
                  ? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                  : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-[var(--text-primary)]">
              {subscription.tier === "FREE" && "$0"}
              {subscription.tier === "FOCUS" && "$18"}
              {subscription.tier === "BRAIN_TRUST" && "$29"}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              {subscription.tier === "FREE" && "forever"}
              {subscription.tier !== "FREE" && "per month"}
            </div>
          </div>
        </div>

        {isActive && !isFree && (
          <div className="mt-6">
            <button
              onClick={handleManageSubscription}
              disabled={loading === "manage"}
              className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-strong)] disabled:opacity-50"
            >
              {loading === "manage" ? "Loading..." : "Manage Subscription"}
            </button>
          </div>
        )}
      </div>

      {/* Upgrade Options */}
      {isFree && (
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Upgrade Your Plan</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Unlock unlimited AI credits, exports, templates, and more.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* Focus Plan */}
            <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-4">
              <div className="mb-2">
                <h3 className="font-semibold text-[var(--text-primary)]">Focus</h3>
                <p className="text-sm text-[var(--text-secondary)]">Full PARA enforcement</p>
              </div>
              <div className="mb-4">
                <span className="text-2xl font-semibold text-[var(--text-primary)]">$18</span>
                <span className="text-sm text-[var(--text-secondary)]">/month</span>
              </div>
              <ul className="mb-4 space-y-1 text-xs text-[var(--text-secondary)]">
                <li>✓ 7 active projects</li>
                <li>✓ Unlimited AI credits</li>
                <li>✓ Exports & templates</li>
                <li>✓ Calendar sync</li>
              </ul>
              <button
                onClick={() => handleCheckout("FOCUS", "monthly")}
                disabled={loading !== null}
                className="w-full rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] transition hover:shadow-[var(--elev-2)] disabled:opacity-50"
              >
                {loading === "FOCUS-monthly" ? "Loading..." : "Upgrade to Focus"}
              </button>
            </div>

            {/* Brain Trust Plan */}
            <div className="rounded-md border border-[var(--primary-strong)] bg-[color-mix(in_srgb,var(--primary-strong)_10%,var(--card))] p-4">
              <div className="mb-2">
                <h3 className="font-semibold text-[var(--text-primary)]">Brain Trust</h3>
                <p className="text-sm text-[var(--text-secondary)]">For teams</p>
              </div>
              <div className="mb-4">
                <span className="text-2xl font-semibold text-[var(--text-primary)]">$29</span>
                <span className="text-sm text-[var(--text-secondary)]">/month</span>
              </div>
              <ul className="mb-4 space-y-1 text-xs text-[var(--text-secondary)]">
                <li>✓ Everything in Focus</li>
                <li>✓ Team workspaces</li>
                <li>✓ Shared projects & areas</li>
                <li>✓ Team analytics</li>
              </ul>
              <button
                onClick={() => handleCheckout("BRAIN_TRUST", "monthly")}
                disabled={loading !== null}
                className="w-full rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] transition hover:shadow-[var(--elev-2)] disabled:opacity-50"
              >
                {loading === "BRAIN_TRUST-monthly" ? "Loading..." : "Upgrade to Brain Trust"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Comparison */}
      <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="pb-2 text-left font-semibold text-[var(--text-primary)]">Feature</th>
                <th className="pb-2 text-center font-semibold text-[var(--text-primary)]">Free</th>
                <th className="pb-2 text-center font-semibold text-[var(--text-primary)]">Focus</th>
                <th className="pb-2 text-center font-semibold text-[var(--text-primary)]">Brain Trust</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              <tr className="border-b border-[var(--border-subtle)]">
                <td className="py-2">Active Projects</td>
                <td className="text-center">3</td>
                <td className="text-center">7</td>
                <td className="text-center">7</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]">
                <td className="py-2">AI Credits</td>
                <td className="text-center">50/month</td>
                <td className="text-center">Unlimited</td>
                <td className="text-center">Unlimited</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]">
                <td className="py-2">Exports</td>
                <td className="text-center">—</td>
                <td className="text-center">✓</td>
                <td className="text-center">✓</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]">
                <td className="py-2">Templates</td>
                <td className="text-center">—</td>
                <td className="text-center">✓</td>
                <td className="text-center">✓</td>
              </tr>
              <tr>
                <td className="py-2">Team Features</td>
                <td className="text-center">—</td>
                <td className="text-center">—</td>
                <td className="text-center">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
