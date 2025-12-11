import { auth } from "@/auth";
import { MAX_ACTIVE_PROJECTS, projectHealth } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

const REVIEW_LOOKBACK_DAYS = 12;

export default async function IntegrityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const [inboxCount, archiveCount, activeProjects, areas, resources, lastReview] = await Promise.all([
    prisma.item.count({ where: { userId, classification: "INBOX", archivedAt: null } }),
    prisma.item.count({ where: { userId, archivedAt: { not: null } } }),
    prisma.project.findMany({ where: { userId, archivedAt: null }, orderBy: { lastActivityAt: "asc" } }),
    prisma.area.findMany({ where: { userId, archivedAt: null }, orderBy: { lastReviewDate: "asc" } }),
    prisma.resourceCollection.findMany({ where: { userId, archivedAt: null }, orderBy: { lastActivityAt: "asc" }, include: { _count: { select: { items: true } } } }),
    prisma.weeklyReview.findFirst({ where: { userId }, orderBy: { completedAt: "desc" } }),
  ]);

  const activeCount = activeProjects.filter((p) => p.status === ProjectStatus.ACTIVE).length;
  const reviewThreshold = new Date();
  reviewThreshold.setDate(reviewThreshold.getDate() - REVIEW_LOOKBACK_DAYS);
  const overdueAreas = areas.filter((a) => !a.lastReviewDate || a.lastReviewDate < reviewThreshold);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">PARA Integrity</h1>
        <p className="text-sm text-zinc-600">One glance system health.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-zinc-500">Inbox</div>
          <div className="text-2xl font-semibold">{inboxCount}</div>
          <div className="text-xs text-zinc-500">{inboxCount > 20 ? "Needs review" : "Manageable"}</div>
        </div>
        <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-zinc-500">Projects</div>
          <div className="text-2xl font-semibold">{activeCount}/{MAX_ACTIVE_PROJECTS}</div>
          <div className="text-xs text-zinc-500">{activeCount >= MAX_ACTIVE_PROJECTS ? "At limit" : "Within limit"}</div>
        </div>
        <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-zinc-500">Last review</div>
          <div className="text-2xl font-semibold">{lastReview ? lastReview.completedAt.toISOString().slice(0,10) : "Not yet"}</div>
          <div className="text-xs text-zinc-500">Stay weekly</div>
        </div>
      </div>

      <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm space-y-2">
        <h2 className="text-sm font-semibold text-zinc-700">Projects health</h2>
        <div className="space-y-2">
          {activeProjects.filter((p) => p.status === ProjectStatus.ACTIVE).map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 text-sm">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-zinc-500">{projectHealth(p.lastActivityAt)}</div>
              </div>
              <Link href={`/projects/${p.id}`} className="text-xs text-blue-600 underline">Open</Link>
            </div>
          ))}
          {activeCount === 0 && <div className="text-sm text-zinc-500">No active projects.</div>}
        </div>
      </section>

      <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm space-y-2">
        <h2 className="text-sm font-semibold text-zinc-700">Areas needing attention</h2>
        <div className="space-y-2">
          {overdueAreas.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 text-sm">
              <div>
                <div className="font-semibold">{a.name}</div>
                <div className="text-xs text-zinc-500">Last review: {a.lastReviewDate ? a.lastReviewDate.toISOString().slice(0,10) : "Never"}</div>
              </div>
              <Link href={`/areas/${a.id}`} className="text-xs text-blue-600 underline">Review</Link>
            </div>
          ))}
          {overdueAreas.length === 0 && <div className="text-sm text-zinc-500">All areas reviewed recently.</div>}
        </div>
      </section>

      <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm space-y-2">
        <h2 className="text-sm font-semibold text-zinc-700">Resources growth</h2>
        <div className="space-y-2">
          {resources.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 text-sm">
              <div>
                <div className="font-semibold">{r.name}</div>
                <div className="text-xs text-zinc-500">{r._count.items} items</div>
              </div>
              <Link href={`/resources/${r.id}`} className="text-xs text-blue-600 underline">Open</Link>
            </div>
          ))}
          {resources.length === 0 && <div className="text-sm text-zinc-500">No collections yet.</div>}
        </div>
      </section>

      <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm space-y-2">
        <h2 className="text-sm font-semibold text-zinc-700">Archive load</h2>
        <p className="text-sm text-zinc-600">Items in archive: {archiveCount}. Periodically clean or restore what matters.</p>
        <Link href="/archive" className="text-xs text-blue-600 underline">Go to archive</Link>
      </section>
    </div>
  );
}
