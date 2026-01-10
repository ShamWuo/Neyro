"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function diffDays(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / 86400000);
}

export function UpgradeBanner() {
  // Initialize with 0 to avoid hydration mismatch, will be set in useEffect
  const [now, setNow] = useState(0);
  const [dismissUntil, setDismissUntil] = useState<number | null>(null);
  const [start, setStart] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use setTimeout to defer state updates and avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setMounted(true);
      // Set initial time after mount
      setNow(Date.now());
      
      const storedStart = window.localStorage.getItem("para-trial-start");
      const startDate = storedStart ? new Date(storedStart) : new Date();
      if (!storedStart) {
        window.localStorage.setItem("para-trial-start", startDate.toISOString());
      }
      setStart(startDate.getTime());

      const storedDismiss = window.localStorage.getItem("para-upgrade-dismissed-until");
      setDismissUntil(storedDismiss ? Number(storedDismiss) : null);
    }, 0);

    const id = window.setInterval(() => setNow(Date.now()), 60000);
    return () => {
      clearTimeout(timer);
      window.clearInterval(id);
    };
  }, []);

  const daysLeft = useMemo(() => {
    if (!start || !mounted) return 14;
    const elapsed = diffDays(new Date(start), new Date(now));
    return Math.max(0, 14 - elapsed);
  }, [start, now, mounted]);

  const dismissed = mounted && dismissUntil !== null && now < dismissUntil;
  if (!mounted || dismissed) return null;

  const hideForHours = (hours: number) => {
    const until = Date.now() + hours * 3600 * 1000;
    window.localStorage.setItem("para-upgrade-dismissed-until", String(until));
    setDismissUntil(until);
  };

  return (
    <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--primary-strong)_10%,var(--surface))] px-4 py-3 text-sm shadow-[var(--elev-1)]">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Trial</p>
          <div className="text-[var(--text-primary)]">
            <span className="font-semibold">{daysLeft} day{daysLeft === 1 ? "" : "s"} left</span> — Unlock Focus for unlimited Smart Assist, exports, and team sharing.
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm font-semibold">
          <Link href="/pricing" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-[var(--text-inverse)] shadow-sm transition hover:shadow-[var(--elev-2)]">Upgrade</Link>
          <button onClick={() => hideForHours(6)} className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-[var(--text-primary)] hover:border-[var(--border-strong)]">Remind me later</button>
          <button onClick={() => hideForHours(72)} className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-[var(--text-secondary)] hover:border-[var(--border-strong)]">No thanks</button>
        </div>
      </div>
    </div>
  );
}
