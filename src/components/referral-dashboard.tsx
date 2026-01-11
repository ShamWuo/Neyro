"use client";

import { useState } from "react";

interface Referral {
  email: string;
  status: string;
  createdAt: Date;
  convertedAt: Date | null;
}

interface ReferralDashboardProps {
  referralCode: string;
  referralCount: number;
  referrals: Referral[];
}

export function ReferralDashboard({ referralCode, referralCount, referrals }: ReferralDashboardProps) {
  const [copied, setCopied] = useState(false);

  const referralUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/register?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent("Try Neyro - The PARA Productivity App");
    const body = encodeURIComponent(
      `I've been using Neyro to organize my life with the PARA method. It's been a game-changer!\n\nSign up with my referral link and we both get 1 month free: ${referralUrl}`
    );
    if (typeof window !== "undefined" && window.location) {
      try {
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      } catch {
        // Fallback for test environments
        window.location.assign(`mailto:?subject=${subject}&body=${body}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] p-4">
          <div className="text-2xl font-semibold text-[var(--text-primary)]">{referralCount}</div>
          <div className="text-sm text-[var(--text-secondary)]">Total Referrals</div>
        </div>
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] p-4">
          <div className="text-2xl font-semibold text-[var(--text-primary)]">
            {referrals.filter((r) => r.status === "converted").length}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Converted</div>
        </div>
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] p-4">
          <div className="text-2xl font-semibold text-[var(--text-primary)]">
            {referrals.filter((r) => r.status === "pending").length}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Pending</div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Your Referral Link</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralUrl}
            readOnly
            className="flex-1 rounded-md border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)]"
          />
          <button
            onClick={handleCopy}
            className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-strong)]"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleEmailShare}
            className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] transition hover:shadow-[var(--elev-2)]"
          >
            Share via Email
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">How It Works</h2>
        <ol className="space-y-2 text-sm text-[var(--text-secondary)]">
          <li className="flex gap-2">
            <span className="font-semibold text-[var(--text-primary)]">1.</span>
            <span>Share your referral link with friends</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-[var(--text-primary)]">2.</span>
            <span>They sign up and try Focus (14-day trial)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-[var(--text-primary)]">3.</span>
            <span>When they upgrade, you both get 1 month free on Focus</span>
          </li>
        </ol>
      </div>

      {/* Referral List */}
      {referrals.length > 0 && (
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Your Referrals</h2>
          <div className="space-y-2">
            {referrals.map((referral, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2"
              >
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">{referral.email}</div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {new Date(referral.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      referral.status === "converted"
                        ? "bg-[var(--success)] text-[var(--text-inverse)]"
                        : "bg-[var(--surface-muted)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {referral.status === "converted" ? "Converted" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
