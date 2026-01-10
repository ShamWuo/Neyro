"use client";

import Link from "next/link";

type SkipLink = {
  href: string;
  label: string;
};

const skipLinks: SkipLink[] = [
  { href: "#main-content", label: "Skip to main content" },
  { href: "#navigation", label: "Skip to navigation" },
  { href: "#search", label: "Skip to search" },
  { href: "#footer", label: "Skip to footer" },
];

export function AccessibilitySkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-4 focus-within:left-4 focus-within:z-50 focus-within:flex focus-within:flex-col focus-within:gap-2">
      {skipLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--elev-2)] transition focus:outline-2 focus:outline-[var(--primary-strong)] focus:outline-offset-2"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
