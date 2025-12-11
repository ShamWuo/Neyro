import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ItemType, ProjectStatus } from "@prisma/client";
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

  async function quickCapture(formData: FormData) {
    "use server";
    const title = String(formData.get("title") ?? "").trim();
    const url = String(formData.get("url") ?? "").trim() || null;
    if (!title) return;
    await prisma.item.create({
      data: {
        userId,
        title,
        url,
        type: ItemType.NOTE,
        classification: ItemClassification.INBOX,
      },
    });
    redirect("/inbox");
  }

  const projectLoad = Math.min(activeProjects / 7, 1);
  const lastReviewDate = lastReview ? lastReview.completedAt.toISOString().slice(0, 10) : null;

  return (
    <div className="space-y-8">
      <div className="panel space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#1e293b]">Today</p>
            <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {name}</h1>
            <p className="text-sm text-[#555]">Capture, sort, file into PARA, then review. Stay under seven projects and ship a weekly summary.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            <Link href="/inbox" className="rounded-md border border-[#0b0d0f] bg-[#0b0d0f] px-4 py-2 text-white">Capture now</Link>
            <Link href="/projects" className="rounded-md border border-[rgba(0,0,0,0.12)] px-4 py-2 text-[#0b0d0f] hover:border-[#0b0d0f]">Add a project</Link>
            <Link href="/review" className="rounded-md border border-[rgba(0,0,0,0.12)] px-4 py-2 text-[#0b0d0f] hover:border-[#0b0d0f]">Start weekly review</Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="panel space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1e293b]">Inbox</div>
            <div className="text-3xl font-semibold">{inboxCount}</div>
            <div className="text-xs text-[#555]">Everything starts here. {inboxCount === 0 ? "Drop something now." : "Process once per day."}</div>
            <Link href="/inbox" className="text-xs font-semibold text-[#1e293b] underline">Open inbox</Link>
          </div>

          <div className={`panel space-y-2 ${activeProjects >= 7 ? "border-[#d14343]" : ""}`}>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-[#1e293b]">
              <span>Active Projects</span>
              <span className="text-[10px] text-[#555]">Cap 7</span>
            </div>
            <div className="text-3xl font-semibold">{activeProjects}/7</div>
            <div className="h-2 overflow-hidden rounded-full bg-[rgba(0,0,0,0.05)]">
              <div className={`${activeProjects >= 7 ? "bg-[#d14343]" : "bg-[#0b0d0f]"} h-full`} style={{ width: `${projectLoad * 100}%` }} />
            </div>
            <div className="text-xs text-[#555]">{activeProjects >= 7 ? "Over cap - pause one before adding." : "Stay below the redline."}</div>
            <Link href="/projects" className="text-xs font-semibold text-[#1e293b] underline">Manage projects</Link>
          </div>

          <div className="panel space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1e293b]">Areas</div>
            <div className="text-3xl font-semibold">{areasCount}</div>
            <div className="text-xs text-[#555]">Keep standards healthy. {areasCount === 0 ? "Define your core areas." : "Touch each weekly."}</div>
            <Link href="/areas" className="text-xs font-semibold text-[#1e293b] underline">Open areas</Link>
          </div>

          <div className="panel space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1e293b]">Last Review</div>
            <div className="text-2xl font-semibold">{lastReviewDate ?? "Not yet"}</div>
            <div className="text-xs text-[#555]">Ship one summary every week.</div>
            <Link href="/review" className="text-xs font-semibold text-[#1e293b] underline">Run weekly review</Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="panel space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0b0d0f]">Guided PARA flow</h2>
            <span className="text-xs text-[#555]">Capture, sort, archive</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2 rounded border border-[rgba(0,0,0,0.08)] bg-[#f8f9fa] p-3 text-sm">
              <div className="font-semibold text-[#0b0d0f]">Capture & Sort</div>
              <p className="text-xs text-[#555]">Drop tasks/notes, batch classify to Project, Area, Resource, or Archive.</p>
              <div className="flex gap-2 text-xs">
                <Link href="/inbox" className="rounded border border-[rgba(0,0,0,0.12)] px-2 py-1">Inbox</Link>
                <Link href="/archive" className="rounded border border-[rgba(0,0,0,0.12)] px-2 py-1">Archive</Link>
              </div>
            </div>
            <div className="space-y-2 rounded border border-[rgba(0,0,0,0.08)] bg-[#f8f9fa] p-3 text-sm">
              <div className="font-semibold text-[#0b0d0f]">Work & Review</div>
              <p className="text-xs text-[#555]">Stay under seven projects, keep areas touched, and publish a weekly review.</p>
              <div className="flex gap-2 text-xs">
                <Link href="/projects" className="rounded border border-[rgba(0,0,0,0.12)] px-2 py-1">Projects</Link>
                <Link href="/areas" className="rounded border border-[rgba(0,0,0,0.12)] px-2 py-1">Areas</Link>
                <Link href="/review" className="rounded border border-[rgba(0,0,0,0.12)] px-2 py-1">Review</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="panel space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0b0d0f]">Onboarding steps</h2>
            <span className="text-xs text-[#555]">Finish these first</span>
          </div>
          <ul className="space-y-2 text-sm text-[#0b0d0f]">
            <li className="flex items-center justify-between rounded border border-[rgba(0,0,0,0.06)] bg-[#f8f9fa] px-3 py-2">
              <span>Add your first project</span>
              <Link href="/projects" className="text-xs font-semibold text-[#1e293b] underline">Add</Link>
            </li>
            <li className="flex items-center justify-between rounded border border-[rgba(0,0,0,0.06)] bg-[#f8f9fa] px-3 py-2">
              <span>Define 3-5 areas</span>
              <Link href="/areas" className="text-xs font-semibold text-[#1e293b] underline">Define</Link>
            </li>
            <li className="flex items-center justify-between rounded border border-[rgba(0,0,0,0.06)] bg-[#f8f9fa] px-3 py-2">
              <span>Capture 5 items into inbox</span>
              <Link href="/inbox" className="text-xs font-semibold text-[#1e293b] underline">Capture</Link>
            </li>
            <li className="flex items-center justify-between rounded border border-[rgba(0,0,0,0.06)] bg-[#f8f9fa] px-3 py-2">
              <span>Run your first weekly review</span>
              <Link href="/review" className="text-xs font-semibold text-[#1e293b] underline">Run</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="panel space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0b0d0f]">Active projects / nearest deadlines</h2>
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
            {activeProjectsList.length === 0 && (
              <div className="flex flex-col gap-2 rounded-md border border-[rgba(0,0,0,0.08)] bg-[#f8f9fa] px-3 py-3 text-sm text-[#555]">
                <div className="font-semibold text-[#0b0d0f]">No active projects yet.</div>
                <div>Start with one clear outcome, set a deadline, and keep under seven.</div>
                <div className="flex gap-2 text-xs font-semibold">
                  <Link href="/projects" className="rounded border border-[rgba(0,0,0,0.12)] px-2 py-1">Create a project</Link>
                  <Link href="/templates" className="rounded border border-[rgba(0,0,0,0.12)] px-2 py-1">Use a template</Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="panel space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0b0d0f]">Quick capture</h2>
            <span className="text-xs text-[#555]">Inbox to classify later</span>
          </div>
          <form action={quickCapture} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
            <input
              name="title"
              placeholder="Task, note, or link"
              className="border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 md:col-span-1"
              required
            />
            <input
              name="url"
              placeholder="URL (optional)"
              className="border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 md:col-span-1"
            />
            <button type="submit" className="rounded-md border border-[rgba(0,0,0,0.12)] px-4 py-2 text-sm font-semibold md:col-span-1">Capture to inbox</button>
          </form>
          <p className="text-xs text-[#555]">Tip: Capture first, classify once per day.</p>
        </div>
      </div>
    </div>
  );
}
