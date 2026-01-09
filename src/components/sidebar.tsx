import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { SidebarNav, type NavSection } from "./sidebar-nav";

const navSections: NavSection[] = [
  {
    title: "Capture",
    items: [
      { href: "/home", label: "Home", icon: "home" },
      { href: "/inbox", label: "Inbox", icon: "inbox" },
      { href: "/focus", label: "Focus", icon: "focus" },
      { href: "/assist", label: "Smart Assist", icon: "assist" },
    ],
  },
  {
    title: "Plan",
    items: [
      { href: "/projects", label: "Projects", icon: "projects" },
      { href: "/areas", label: "Areas", icon: "areas" },
      { href: "/backlog", label: "Backlog", icon: "backlog" },
      { href: "/templates", label: "Templates", icon: "templates" },
    ],
  },
  {
    title: "Library",
    items: [
      { href: "/resources", label: "Resources", icon: "resources" },
      { href: "/archive", label: "Archive", icon: "archive" },
    ],
  },
  {
    title: "Review",
    items: [
      { href: "/review", label: "Weekly Review", icon: "review" },
      { href: "/weekly-review", label: "Wizard", icon: "review" },
      { href: "/analytics", label: "Analytics", icon: "analytics" },
      { href: "/activity", label: "Activity", icon: "activity" },
      { href: "/search", label: "Search", icon: "search" },
      { href: "/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export async function Sidebar() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const email = session.user.email ?? "Account";

  return (
    <aside className="hidden h-screen w-72 flex-none border-r border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] backdrop-blur-xl md:flex">
      <div className="flex h-full w-full flex-col gap-8 px-5 py-8">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--primary-strong)] via-[color-mix(in_srgb,var(--primary-strong)_80%,#0c1222_20%)] to-[var(--accent)] p-4 text-white shadow-[var(--elev-2)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-base font-semibold uppercase">NE</div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Neyro PARA</p>
              <p className="text-sm font-semibold">Second brain cockpit</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-white/80">Capture → Projects → Areas → Resources → Review. Fewer clicks, clearer focus, steady cadence.</p>
        </div>

        <SidebarNav sections={navSections} />

        <div className="mt-auto space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 text-sm text-[var(--text-secondary)] shadow-inner">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Signed in</p>
            <p className="text-base font-semibold text-[var(--text-primary)]">{email}</p>
          </div>
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-xs">
            <p className="font-semibold text-[var(--text-primary)]">Try this</p>
            <p>Run the weekly wizard, log streaks, and archive anything done.</p>
          </div>
          <div className="rounded-lg border border-[color-mix(in_srgb,var(--primary-strong)_65%,transparent)] bg-[color-mix(in_srgb,var(--primary-strong)_10%,var(--surface))] px-3 py-3 text-xs shadow-[var(--elev-1)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]">Upgrade</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Unlock the Focus plan</p>
            <ul className="mt-2 space-y-1 text-[11px] text-[var(--text-secondary)]">
              <li>• Unlimited Smart Assist credits</li>
              <li>• Advanced templates and exports</li>
              <li>• Activity trail and timeline</li>
            </ul>
            <Link href="/pricing" className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-center text-[11px] font-semibold text-white transition hover:shadow-[var(--elev-2)]">
              See plans
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-2 text-xs font-semibold flex-1">
              <Link href="/profile" className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-center text-[var(--text-primary)] hover:border-[var(--border-strong)]">
                Profile
              </Link>
              <form
                className="flex-1"
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button type="submit" className="w-full rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-white shadow-sm transition hover:shadow-[var(--elev-1)]">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
