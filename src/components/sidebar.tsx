import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

const links = [
  { href: "/home", label: "Home" },
  { href: "/focus", label: "Today" },
  { href: "/inbox", label: "Inbox" },
  { href: "/projects", label: "Projects" },
  { href: "/areas", label: "Areas" },
  { href: "/resources", label: "Resources" },
  { href: "/backlog", label: "Backlog" },
  { href: "/archive", label: "Archive" },
  { href: "/review", label: "Review" },
  { href: "/assist", label: "Smart Assist" },
  { href: "/integrity", label: "Integrity" },
  { href: "/timeline", label: "Timeline" },
  { href: "/activity", label: "Activity" },
  { href: "/templates", label: "Templates" },
];

export async function Sidebar() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <aside className="w-64 border-r border-zinc-200 bg-white px-4 py-6 space-y-6">
      <div className="space-y-1">
        <div className="text-xs font-semibold uppercase text-zinc-500">Neyro</div>
        <div className="text-sm text-zinc-500">Signed in as</div>
        <div className="font-semibold">{session.user.email}</div>
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="block rounded px-2 py-1 hover:bg-zinc-100">
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="space-y-2">
        <div className="text-xs text-zinc-500">Account</div>
        <a href="/profile" className="text-sm text-blue-600 underline">Profile</a>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
