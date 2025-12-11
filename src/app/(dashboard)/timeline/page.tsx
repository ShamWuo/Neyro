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
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
          <p className="text-sm text-[#555]">Upcoming deadlines and calendar export.</p>
        </div>
        <a href="/api/calendar" className="text-sm font-semibold text-[#0f172a] underline">Export ICS</a>
      </div>

      <div className="panel space-y-3">
        {projects.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded border border-[rgba(0,0,0,0.06)] bg-[#f8f9fa] px-4 py-3">
            <div className="w-32 text-sm text-[#555]">{p.deadline?.toISOString().slice(0,10)}</div>
            <div className="flex-1">
              <div className="font-semibold text-[#0b0d0f]">{p.name}</div>
              <div className="text-xs text-[#555]">{p.outcome}</div>
            </div>
            <Link href={`/projects/${p.id}`} className="text-xs font-semibold text-[#0f172a]">Open</Link>
          </div>
        ))}
        {projects.length === 0 && <div className="text-sm text-[#555]">No deadlines set.</div>}
      </div>
    </div>
  );
}
