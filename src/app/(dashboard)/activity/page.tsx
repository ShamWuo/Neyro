import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = (day + 6) % 7; // Monday-based
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export default async function ActivityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const since = new Date();
  since.setDate(since.getDate() - 56);

  const [createdItems, archivedItems, activeProjects] = await Promise.all([
    prisma.item.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.item.findMany({ where: { userId, archivedAt: { not: null, gte: since } }, select: { archivedAt: true } }),
    prisma.project.findMany({ where: { userId, archivedAt: null }, select: { createdAt: true, status: true } }),
  ]);

  const buckets = new Map<string, { created: number; archived: number }>();
  createdItems.forEach((i) => {
    const key = startOfWeek(i.createdAt).toISOString();
    buckets.set(key, { created: (buckets.get(key)?.created ?? 0) + 1, archived: buckets.get(key)?.archived ?? 0 });
  });
  archivedItems.forEach((i) => {
    if (!i.archivedAt) return;
    const key = startOfWeek(i.archivedAt).toISOString();
    buckets.set(key, { created: buckets.get(key)?.created ?? 0, archived: (buckets.get(key)?.archived ?? 0) + 1 });
  });
  const rows = Array.from(buckets.entries())
    .map(([k, v]) => ({ week: k, ...v }))
    .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="text-sm text-[#555]">Volume over the last 8 weeks.</p>
      </div>

      <div className="panel space-y-3">
        {rows.map((r) => (
          <div key={r.week} className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#555]">Week of {r.week.slice(0,10)}</span>
              <span className="text-xs text-[#555]">Created {r.created} · Archived {r.archived}</span>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded bg-[#eef1f5]">
              <div className="bg-[#0f172a]" style={{ width: `${Math.min(100, r.created * 5)}%` }} />
              <div className="bg-[#3b82f6]" style={{ width: `${Math.min(100, r.archived * 5)}%` }} />
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-sm text-[#555]">Not enough data yet.</div>}
      </div>

      <div className="panel">
        <div className="text-sm font-semibold text-[#0b0d0f]">Active project count</div>
        <div className="text-2xl font-semibold mt-1 text-[#0b0d0f]">{activeProjects.filter((p) => p.status === "ACTIVE").length}</div>
      </div>
    </div>
  );
}
