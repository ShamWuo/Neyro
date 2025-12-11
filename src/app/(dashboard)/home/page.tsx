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
    <div className="space-y-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {name}</h1>
          <p className="text-sm text-[#555]">Capture decisively, keep seven active projects, review weekly.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/inbox" className="rounded-md border border-[#0b0d0f] bg-[#0b0d0f] px-4 py-2 text-sm font-semibold text-white">Go to Inbox</Link>
          <Link href="/review" className="rounded-md border border-[rgba(0,0,0,0.12)] px-4 py-2 text-sm font-semibold text-[#0b0d0f] hover:border-[#0b0d0f]">Start Weekly Review</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/inbox" className="panel block space-y-1">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1e293b]">Inbox</div>
          <div className="text-3xl font-semibold">{inboxCount}</div>
          <div className="text-xs text-[#555]">Everything starts here.</div>
        </Link>
        <Link
          href="/projects"
          className={`panel block space-y-1 ${activeProjects >= 7 ? "border-[#d14343]" : ""}`}
        >
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1e293b]">Active Projects</div>
          <div className="text-3xl font-semibold">{activeProjects}/7</div>
          <div className="text-xs text-[#555]">Stay within the guardrail.</div>
        </Link>
        <Link href="/areas" className="panel block space-y-1">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1e293b]">Areas</div>
          <div className="text-3xl font-semibold">{areasCount}</div>
          <div className="text-xs text-[#555]">Standards stay clear.</div>
        </Link>
        <Link href="/review" className="panel block space-y-1">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1e293b]">Last Review</div>
          <div className="text-3xl font-semibold">{lastReview ? lastReview.completedAt.toISOString().slice(0, 10) : "Not yet"}</div>
          <div className="text-xs text-[#555]">Log weekly to keep integrity.</div>
        </Link>
      </div>

      <div className="panel space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0b0d0f]">Active projects · nearest deadlines</h2>
          <Link href="/projects" className="text-xs font-semibold text-[#1e293b] underline">View all</Link>
        </div>
        <div className="space-y-2">
          {activeProjectsList.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="flex items-center justify-between rounded-md border border-[rgba(0,0,0,0.06)] px-3 py-2 text-sm transition hover:-translate-y-[1px] hover:border-[#0b0d0f]"
            >
              <div>
                <div className="font-semibold text-[#0b0d0f]">{p.name}</div>
                <div className="text-xs text-[#555]">{p.outcome}</div>
              </div>
              <div className="text-xs text-[#1e293b]">{p.deadline ? p.deadline.toISOString().slice(0, 10) : "No deadline"}</div>
            </Link>
          ))}
          {activeProjectsList.length === 0 && <div className="text-sm text-[#555]">No active projects yet.</div>}
        </div>
      </div>
    </div>
  );
}
