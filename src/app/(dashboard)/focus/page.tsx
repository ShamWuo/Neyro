import { auth } from "@/auth";
import { getActiveProjectCount } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ItemType, ProjectStatus } from "@prisma/client";
import { redirect } from "next/navigation";

function startOfToday() {
  const iso = new Date().toISOString().slice(0, 10);
  return new Date(iso);
}

export default async function FocusPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;
  const dayStart = startOfToday();
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [activeCount, activeProjects, dailyFocus, pinned, suggested, sessions] = await Promise.all([
    getActiveProjectCount(userId),
    prisma.project.findMany({ where: { userId, archivedAt: null, status: ProjectStatus.ACTIVE }, orderBy: { name: "asc" } }),
    prisma.dailyFocus.findFirst({ where: { userId, date: dayStart }, include: { project: true } }),
    prisma.focusPin.findMany({ where: { userId, date: { gte: dayStart, lt: dayEnd } }, include: { item: true } }),
    prisma.item.findMany({
      where: {
        userId,
        classification: ItemClassification.PROJECT,
        type: ItemType.TASK,
        isDone: false,
        archivedAt: null,
        project: { status: ProjectStatus.ACTIVE, archivedAt: null },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
      include: { project: true },
    }),
    prisma.focusSession.findMany({ where: { userId, date: { gte: dayStart, lt: dayEnd } }, orderBy: { createdAt: "asc" } }),
  ]);

  async function setDailyProject(formData: FormData) {
    "use server";
    const projectId = String(formData.get("projectId") ?? "").trim();
    if (!projectId) return;
    await prisma.dailyFocus.upsert({
      where: { userId_date: { userId, date: dayStart } },
      update: { projectId },
      create: { userId, date: dayStart, projectId },
    });
    redirect("/focus");
  }

  async function pinItem(formData: FormData) {
    "use server";
    const itemId = String(formData.get("itemId") ?? "").trim();
    if (!itemId) return;
    await prisma.focusPin.upsert({
      where: { userId_itemId_date: { userId, itemId, date: dayStart } },
      update: {},
      create: { userId, itemId, date: dayStart },
    });
    redirect("/focus");
  }

  async function unpin(itemId: string) {
    "use server";
    await prisma.focusPin.deleteMany({ where: { userId, itemId, date: { gte: dayStart, lt: dayEnd } } });
    redirect("/focus");
  }

  async function addSession(formData: FormData) {
    "use server";
    const label = String(formData.get("label") ?? "").trim();
    const minutes = Number(formData.get("minutes") ?? "");
    if (!label || !minutes) return;
    await prisma.focusSession.create({ data: { userId, date: dayStart, label, minutes } });
    redirect("/focus");
  }

  const pinnedItems = pinned.map((p) => p.item);
  const pinnedIds = new Set(pinnedItems.map((i) => i.id));
  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Today</h1>
          <p className="text-sm text-zinc-600">Pick one project, pin up to three tasks, and time-box your day.</p>
        </div>
        <div className="text-xs text-zinc-500">Active projects: {activeCount}</div>
      </div>

      <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">Project of the day</h2>
          {activeCount > 5 && <span className="text-xs text-amber-600">Nudge: You have {activeCount} active projects — pick one.</span>}
        </div>
        <form action={setDailyProject} className="flex flex-wrap items-center gap-2 text-sm">
          <select name="projectId" defaultValue={dailyFocus?.projectId ?? ""} className="rounded border border-zinc-300 px-3 py-2">
            <option value="">Choose a project</option>
            {activeProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button type="submit" className="rounded bg-black px-4 py-2 text-white">Commit</button>
          {dailyFocus?.project && <span className="text-xs text-zinc-500">Committed: {dailyFocus.project.name}</span>}
        </form>
      </section>

      <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">Pinned for today</h2>
          <span className="text-xs text-zinc-500">Up to 3 tasks</span>
        </div>
        <div className="space-y-2">
          {pinnedItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2">
              <div>
                <div className="font-semibold">{item.title}</div>
                {item.projectId && <div className="text-xs text-zinc-500">Project task</div>}
              </div>
              <form action={() => unpin(item.id)}><button className="text-xs text-red-600">Unpin</button></form>
            </div>
          ))}
          {pinnedItems.length === 0 && <div className="text-sm text-zinc-500">Nothing pinned yet.</div>}
        </div>
      </section>

      <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">Suggested tasks</h2>
          <span className="text-xs text-zinc-500">From active projects</span>
        </div>
        <div className="space-y-2">
          {suggested.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2">
              <div>
                <div className="font-semibold">{item.title}</div>
                <div className="text-xs text-zinc-500">{item.project?.name ?? "Project"}</div>
              </div>
              {!pinnedIds.has(item.id) && pinnedItems.length < 3 && (
                <form action={pinItem}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <button className="text-xs rounded border px-2 py-1">Pin</button>
                </form>
              )}
            </div>
          ))}
          {suggested.length === 0 && <div className="text-sm text-zinc-500">No active tasks found.</div>}
        </div>
      </section>

      <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">Time boxes</h2>
          <span className="text-xs text-zinc-500">Total: {totalMinutes} min</span>
        </div>
        <form action={addSession} className="flex flex-wrap gap-2 text-sm">
          <input name="label" placeholder="Focus block" className="rounded border border-zinc-300 px-3 py-2 flex-1" required />
          <input name="minutes" type="number" min={15} step={5} placeholder="Minutes" className="rounded border border-zinc-300 px-3 py-2 w-28" required />
          <button type="submit" className="rounded bg-black px-4 py-2 text-white">Add</button>
        </form>
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 text-sm">
              <div>{s.label}</div>
              <div className="text-xs text-zinc-500">{s.minutes} min</div>
            </div>
          ))}
          {sessions.length === 0 && <div className="text-sm text-zinc-500">No sessions logged yet.</div>}
        </div>
      </section>
    </div>
  );
}
