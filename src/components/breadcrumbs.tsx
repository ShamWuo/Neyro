"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";

const labels: Record<string, string> = {
  home: "Home",
  inbox: "Inbox",
  projects: "Projects",
  areas: "Areas",
  resources: "Resources",
  archive: "Archive",
  backlog: "Backlog",
  templates: "Templates",
  focus: "Focus",
  review: "Weekly review",
  "weekly-review": "Wizard",
  integrity: "Integrity",
  timeline: "Timeline",
  activity: "Activity",
  assist: "Smart Assist",
  search: "Search",
};

export const Breadcrumbs = memo(function Breadcrumbs() {
  const pathname = usePathname();
  
  const crumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return null;
    
    return parts.map((part, idx) => {
      const href = `/${parts.slice(0, idx + 1).join("/")}`;
      return { href, label: labels[part] ?? part };
    });
  }, [pathname]);

  if (!crumbs) return null;

  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)]">
      <Link href="/home" className="font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Home</Link>
      {crumbs.map((crumb, idx) => (
        <span key={crumb.href} className="flex items-center gap-2">
          <span aria-hidden>›</span>
          {idx === crumbs.length - 1 ? (
            <span className="text-[var(--text-primary)]">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-[var(--text-primary)]">{crumb.label}</Link>
          )}
        </span>
      ))}
      <span aria-hidden className="ml-2 text-[var(--text-tertiary)]">|</span>
      <Link href="/pricing" className="rounded-md border border-[var(--border-subtle)] px-2 py-1 text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]">
        Upgrade
      </Link>
    </nav>
  );
});
