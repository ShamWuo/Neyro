import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/inbox", label: "Inbox" },
  { href: "/projects", label: "Projects" },
  { href: "/areas", label: "Areas" },
  { href: "/resources", label: "Resources" },
  { href: "/archive", label: "Archive" },
  { href: "/weekly-review", label: "Weekly Review" },
];

export async function Sidebar() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <aside className="w-64 border-r border-zinc-200 bg-white px-4 py-6 space-y-6">
      <div>
        <div className="text-sm text-zinc-500">Signed in</div>
        <div className="font-semibold">{session.user.email}</div>
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="block rounded px-2 py-1 hover:bg-zinc-100">
            {link.label}
          </Link>
        ))}
      </nav>
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
    </aside>
  );
}
