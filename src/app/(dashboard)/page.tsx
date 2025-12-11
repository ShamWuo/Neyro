import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;
  const name = session.user.name ?? session.user.email ?? "there";

  const [inboxCount, activeProjects, areasCount, lastReview, activeProjectsList] = await Promise.all([
    prisma.item.count({ where: { userId, classification: ItemClassification.INBOX, archivedAt: null } }),
    prisma.project.count({ where: { userId, status: ProjectStatus.ACTIVE, archivedAt: null } }),
    prisma.area.count({ where: { userId, archivedAt: null } }),
    prisma.weeklyReview.findFirst({ where: { userId }, orderBy: { completedAt: "desc" } }),
    prisma.project.findMany({
      where: { userId, status: ProjectStatus.ACTIVE, archivedAt: null },
      orderBy: [{ deadline: "asc" }, { createdAt: "asc" }],
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {name}</h1>
          <p className="text-sm text-zinc-600">Capture fast, cap projects at seven, review weekly.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/inbox" className="rounded bg-black px-4 py-2 text-white text-sm">Go to Inbox</Link>
          <Link href="/review" className="rounded border border-zinc-300 px-4 py-2 text-sm">Start Weekly Review</Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Link href="/inbox" className="rounded border border-zinc-200 bg-white p-4 shadow-sm block">
          <div className="text-sm text-zinc-500">Inbox</div>
          <div className="text-2xl font-semibold">{inboxCount}</div>
          <div className="text-xs text-zinc-500">Everything starts here.</div>
        </Link>
        <Link href="/projects" className={`rounded border border-zinc-200 bg-white p-4 shadow-sm block ${activeProjects >= 7 ? "border-red-300" : ""}`}>
          <div className="text-sm text-zinc-500">Active Projects</div>
          <div className="text-2xl font-semibold">{activeProjects}/7</div>
          <div className="text-xs text-zinc-500">Stay under the limit.</div>
        </Link>
        <Link href="/areas" className="rounded border border-zinc-200 bg-white p-4 shadow-sm block">
          <div className="text-sm text-zinc-500">Areas</div>
          <div className="text-2xl font-semibold">{areasCount}</div>
          <div className="text-xs text-zinc-500">Guard your standards.</div>
        </Link>
        <Link href="/review" className="rounded border border-zinc-200 bg-white p-4 shadow-sm block">
          <div className="text-sm text-zinc-500">Last Review</div>
          <div className="text-2xl font-semibold">{lastReview ? lastReview.completedAt.toISOString().slice(0, 10) : "Not yet"}</div>
          <div className="text-xs text-zinc-500">Log weekly to stay aligned.</div>
        </Link>
      </div>

      <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">Active projects (next deadlines)</h2>
          <Link href="/projects" className="text-xs text-blue-600 underline">View all</Link>
        </div>
        <div className="space-y-2">
          {activeProjectsList.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 hover:bg-zinc-50">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-zinc-500">{p.outcome}</div>
              </div>
              <div className="text-xs text-zinc-600">{p.deadline ? p.deadline.toISOString().slice(0, 10) : "No deadline"}</div>
            </Link>
          ))}
          {activeProjectsList.length === 0 && <div className="text-sm text-zinc-500">No active projects yet.</div>}
        </div>
      </div>
    </div>
  );
}
