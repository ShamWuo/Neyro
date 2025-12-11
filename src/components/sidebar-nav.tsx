"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export type NavItem = {
  label: string;
  href: string;
  icon: IconName;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

type IconName =
  | "home"
  | "focus"
  | "inbox"
  | "projects"
  | "areas"
  | "resources"
  | "backlog"
  | "archive"
  | "review"
  | "assist"
  | "integrity"
  | "activity"
  | "templates"
  | "timeline"
  | "search";

function Icon({ name, active }: { name: IconName; active: boolean }) {
  const stroke = active ? "#0f172a" : "#7b839a";
  const common = { stroke, strokeWidth: 1.6, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;

  switch (name) {
    case "home":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path {...common} d="M4 11.5 12 5l8 6.5" />
          <path {...common} d="M6 10.5V19h12v-8.5" />
        </svg>
      );
    case "focus":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <circle {...common} cx="12" cy="12" r="6" />
          <path {...common} d="M12 4v2m0 12v2m8-8h-2M6 12H4" />
        </svg>
      );
    case "inbox":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path {...common} d="M4 7h16l-2 10H6z" />
          <path {...common} d="M4 12h4l2 2h4l2-2h4" />
        </svg>
      );
    case "projects":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path {...common} d="M5 7h14v4H5z" />
          <path {...common} d="M5 13h9v4H5z" />
        </svg>
      );
    case "areas":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <rect {...common} x="4" y="4" width="6" height="6" rx="1" />
          <rect {...common} x="14" y="4" width="6" height="6" rx="1" />
          <rect {...common} x="4" y="14" width="6" height="6" rx="1" />
          <rect {...common} x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      );
    case "resources":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path {...common} d="M4 7h6l2 2h8v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
        </svg>
      );
    case "backlog":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <circle {...common} cx="12" cy="12" r="7" />
          <path {...common} d="M12 8v5l3 2" />
        </svg>
      );
    case "archive":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <rect {...common} x="4" y="5" width="16" height="4" rx="1" />
          <path {...common} d="M6 9v9h12V9" />
          <path {...common} d="M10 13h4" />
        </svg>
      );
    case "review":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path {...common} d="M5 5h14v14H5z" />
          <path {...common} d="M8 9h8M8 13h5" />
          <path {...common} d="m11 16 1 1 3-3" />
        </svg>
      );
    case "assist":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path {...common} d="M12 3v4m0 10v4M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8M3 12h4m10 0h4M5.6 18.4l2.8-2.8m7.2-7.2 2.8-2.8" />
        </svg>
      );
    case "integrity":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path {...common} d="M12 4 5 7v5c0 4.5 3 6.5 7 8 4-1.5 7-3.5 7-8V7z" />
          <path {...common} d="M9.5 12.5 11 14l3.5-3.5" />
        </svg>
      );
    case "activity":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path {...common} d="M4 13h4l2-6 4 12 2-6h2" />
        </svg>
      );
    case "templates":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path {...common} d="M7 4h7l4 4v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path {...common} d="M14 4v4h4" />
        </svg>
      );
    case "timeline":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path {...common} d="M8 7h12" />
          <path {...common} d="M4 12h16" />
          <path {...common} d="M8 17h12" />
          <circle {...common} cx="6" cy="7" r="1.5" />
          <circle {...common} cx="14" cy="12" r="1.5" />
          <circle {...common} cx="10" cy="17" r="1.5" />
        </svg>
      );
    case "search":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <circle {...common} cx="11" cy="11" r="5" />
          <path {...common} d="m15.5 15.5 3 3" />
        </svg>
      );
  }
}

export function SidebarNav({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    sections.forEach((section) => {
      section.items.forEach((item) => {
        router.prefetch(item.href);
      });
    });
  }, [router, sections]);

  return (
    <nav className="space-y-6">
      {sections.map((section) => (
        <div key={section.title} className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9aa0ab]">{section.title}</div>
          <div className="space-y-1">
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg border border-transparent border-l-4 px-3 py-2 text-sm transition ${
                    active
                      ? "border-l-[#5b4bff] bg-white/95 text-[#0f172a] shadow-[0_10px_25px_rgba(15,23,42,0.08)]"
                      : "border-l-transparent text-[#6b7280] hover:border-white/70 hover:bg-white/80"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-md border text-xs ${
                      active ? "border-[#5b4bff] bg-white" : "border-white/70 bg-white"
                    }`}
                  >
                    <Icon name={item.icon} active={active} />
                  </span>
                  <span className={`flex-1 leading-tight ${active ? "font-semibold" : "font-medium"}`}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
