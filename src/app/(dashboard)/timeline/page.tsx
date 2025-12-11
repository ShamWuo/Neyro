import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TimelinePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const projects = await prisma.project.findMany({
    where: { userId, archivedAt: null, deadline: { not: null } },
    orderBy: { deadline: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Timeline</h1>
          <p className="text-sm text-zinc-600">See upcoming deadlines and export to calendar.</p>
        </div>
        <a href="/api/calendar" className="text-sm text-blue-700 underline">Export ICS</a>
      </div>

      <div className="space-y-3 rounded border border-zinc-200 bg-white p-4 shadow-sm">
        {projects.map((p) => (
          <div key={p.id} className="flex items-center gap-3">
            <div className="w-32 text-sm text-zinc-600">{p.deadline?.toISOString().slice(0,10)}</div>
            <div className="flex-1 rounded border border-zinc-200 px-3 py-2">
              <div className="font-semibold">{p.name}</div>
              <div className="text-xs text-zinc-500">{p.outcome}</div>
            </div>
            <Link href={`/projects/${p.id}`} className="text-xs text-blue-600 underline">Open</Link>
          </div>
        ))}
        {projects.length === 0 && <div className="text-sm text-zinc-500">No deadlines set.</div>}
      </div>
    </div>
  );
}
