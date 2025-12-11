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
    title: "System",
    items: [
      { href: "/projects", label: "Projects", icon: "projects" },
      { href: "/areas", label: "Areas", icon: "areas" },
      { href: "/resources", label: "Resources", icon: "resources" },
      { href: "/backlog", label: "Backlog", icon: "backlog" },
      { href: "/templates", label: "Templates", icon: "templates" },
    ],
  },
  {
    title: "Reviews",
    items: [
      { href: "/review", label: "Weekly Review", icon: "review" },
      { href: "/weekly-review", label: "Wizard", icon: "review" },
      { href: "/integrity", label: "Integrity", icon: "integrity" },
      { href: "/timeline", label: "Timeline", icon: "timeline" },
      { href: "/activity", label: "Activity", icon: "activity" },
      { href: "/archive", label: "Archive", icon: "archive" },
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
    <aside className="hidden h-screen w-72 flex-none border-r border-[rgba(0,0,0,0.08)] bg-white/90 backdrop-blur-sm md:flex">
      <div className="flex h-full w-full flex-col gap-8 px-5 py-8">
        <div className="space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1e293b]">Neyro PARA</div>
          <div className="text-sm text-[#555]">Clean, focused workspace</div>
        </div>

        <SidebarNav sections={navSections} />

        <div className="mt-auto space-y-3 border-t border-[rgba(0,0,0,0.08)] pt-4 text-sm">
          <div>
            <div className="text-xs text-[#555]">Signed in</div>
            <div className="font-semibold text-[#0b0d0f]">{email}</div>
          </div>
          <div className="flex gap-2">
            <Link href="/profile" className="flex-1 rounded-md border border-[rgba(0,0,0,0.1)] px-3 py-2 text-center text-xs font-semibold text-[#0b0d0f] hover:border-[#0b0d0f]">
              Profile
            </Link>
            <form
              className="flex-1"
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button type="submit" className="w-full rounded-md border border-[#0b0d0f] bg-[#0b0d0f] px-3 py-2 text-xs font-semibold text-white hover:shadow-sm">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
