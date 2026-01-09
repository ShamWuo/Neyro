"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/home", label: "Home", icon: "🏠" },
  { href: "/inbox", label: "Inbox", icon: "📥" },
  { href: "/projects", label: "Projects", icon: "📁" },
  { href: "/areas", label: "Areas", icon: "🎯" },
  { href: "/review", label: "Review", icon: "📊" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  // Only show on mobile and dashboard pages
  if (pathname?.startsWith("/auth") || pathname === "/" || pathname === "/pricing") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-subtle)] bg-[var(--surface)] mobile-safe-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                isActive
                  ? "text-[var(--primary-strong)]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

