import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { SidebarNav, type NavSection } from "./sidebar-nav";

const navSections: NavSection[] = [
  {
    title: "Today",
    items: [
      { href: "/home", label: "Home", icon: "home" },
      { href: "/focus", label: "Focus", icon: "focus" },
      { href: "/inbox", label: "Inbox", icon: "inbox" },
    ],
  },
  {
    title: "PARA",
    items: [
      { href: "/projects", label: "Projects", icon: "projects" },
      { href: "/areas", label: "Areas", icon: "areas" },
      { href: "/resources", label: "Resources", icon: "resources" },
      { href: "/archive", label: "Archive", icon: "archive" },
      { href: "/backlog", label: "Backlog", icon: "backlog" },
      { href: "/templates", label: "Templates", icon: "templates" },
    ],
  },
  {
    title: "Review",
    items: [
      { href: "/review", label: "Weekly Review", icon: "review" },
      { href: "/weekly-review", label: "Wizard", icon: "review" },
      { href: "/integrity", label: "Integrity", icon: "integrity" },
      { href: "/timeline", label: "Timeline", icon: "timeline" },
      { href: "/activity", label: "Activity", icon: "activity" },
      { href: "/assist", label: "Smart Assist", icon: "assist" },
      { href: "/search", label: "Search", icon: "search" },
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
    <aside className="hidden h-screen w-72 flex-none border-r border-white/40 bg-white/80 backdrop-blur-xl md:flex">
      <div className="flex h-full w-full flex-col gap-8 px-5 py-8">
        <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-[#0f172a] via-[#1b1f3a] to-[#0b0d0f] p-4 text-white shadow-[0_15px_45px_rgba(11,13,15,0.4)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-base font-semibold uppercase">np</div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Neyro PARA</p>
              <p className="text-sm font-semibold">Second brain cockpit</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-white/75">Capture → Projects → Areas → Resources → Weekly review. Same loop, enforced daily.</p>
        </div>

        <SidebarNav sections={navSections} />

        <div className="mt-auto space-y-4 rounded-2xl border border-white/60 bg-white/80 p-4 text-sm text-[#4f586d] shadow-inner">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7c8498]">Signed in</p>
            <p className="text-base font-semibold text-[#0f172a]">{email}</p>
          </div>
          <div className="rounded-lg border border-[#e1e5f4] bg-[#f8f9ff] px-3 py-2 text-xs text-[#61677c]">
            <p className="font-semibold text-[#0f172a]">Try this</p>
            <p>Run the weekly wizard, log streaks, and archive anything done.</p>
          </div>
          <div className="flex gap-2 text-xs font-semibold">
            <Link href="/profile" className="flex-1 rounded-md border border-[#d6dbf0] bg-white px-3 py-2 text-center text-[#0f172a] hover:border-[#0f172a]">
              Profile
            </Link>
            <form
              className="flex-1"
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button type="submit" className="w-full rounded-md border border-[#0f172a] bg-[#0f172a] px-3 py-2 text-white shadow-sm hover:-translate-y-[1px]">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
