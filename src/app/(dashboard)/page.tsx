import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const [inboxCount, activeProjects, areasCount, lastReview] = await Promise.all([
    prisma.item.count({ where: { userId, classification: ItemClassification.INBOX } }),
    prisma.project.count({ where: { userId, status: ProjectStatus.ACTIVE, archivedAt: null } }),
    prisma.area.count({ where: { userId, archivedAt: null } }),
    prisma.weeklyReview.findFirst({ where: { userId }, orderBy: { completedAt: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome to PARA</h1>
        <p className="text-zinc-700">Stay under 7 active projects. Clear Inbox weekly. Keep areas healthy.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Link href="/inbox" className="rounded border border-zinc-200 bg-white p-4 shadow-sm block">
          <div className="text-sm text-zinc-500">Inbox</div>
          <div className="text-2xl font-semibold">{inboxCount}</div>
          <div className="text-xs text-zinc-500">Clear before end of week.</div>
        </Link>
        <Link href="/projects" className="rounded border border-zinc-200 bg-white p-4 shadow-sm block">
          <div className="text-sm text-zinc-500">Active projects</div>
          <div className="text-2xl font-semibold">{activeProjects}/7</div>
          <div className="text-xs text-zinc-500">Limit enforced.</div>
        </Link>
        <Link href="/areas" className="rounded border border-zinc-200 bg-white p-4 shadow-sm block">
          <div className="text-sm text-zinc-500">Areas</div>
          <div className="text-2xl font-semibold">{areasCount}</div>
          <div className="text-xs text-zinc-500">Keep standards visible.</div>
        </Link>
      </div>

      <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-500">Latest weekly review</div>
            <div className="text-lg font-semibold">{lastReview ? lastReview.completedAt.toISOString().slice(0, 10) : "Not yet"}</div>
          </div>
          <Link href="/weekly-review" className="rounded bg-black px-3 py-2 text-white text-sm">
            Start review
          </Link>
        </div>
        {lastReview && (
          <div className="mt-2 text-sm text-zinc-600 flex gap-4">
            <span>Inbox: {lastReview.inboxCount}</span>
            <span>Active projects: {lastReview.activeProjectsCount}</span>
            <span>Area avg: {lastReview.areaHealthAverage ?? "n/a"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
