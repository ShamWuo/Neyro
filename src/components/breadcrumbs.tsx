"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length <= 1) return null;

  const crumbs = parts.map((part, idx) => {
    const href = `/${parts.slice(0, idx + 1).join("/")}`;
    return { href, label: labels[part] ?? part };
  });

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
    </nav>
  );
}
