import { auth } from "@/auth";
import { ensureProjectLimit, touchArea, touchCollection, touchProject } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ItemType, ProjectStatus } from "@prisma/client";
import { redirect } from "next/navigation";

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export default async function AssistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const [inboxRecent, staleProjects, neglectedAreas, resourceCandidates] = await Promise.all([
    prisma.item.findMany({ where: { userId, classification: ItemClassification.INBOX, archivedAt: null, createdAt: { gte: daysAgo(7) } }, orderBy: { createdAt: "desc" } }),
    prisma.project.findMany({ where: { userId, archivedAt: null, status: ProjectStatus.ACTIVE, lastActivityAt: { lt: daysAgo(7) } } }),
    prisma.area.findMany({ where: { userId, archivedAt: null, lastActivityAt: { lt: daysAgo(14) } }, orderBy: { lastActivityAt: "asc" } }),
    prisma.resourceCollection.findMany({
      where: { userId, archivedAt: null },
      include: { _count: { select: { items: true } } },
      orderBy: { items: { _count: "desc" } },
    }),
  ]);

  const duplicateGroups = Object.values(
    inboxRecent.reduce<Record<string, { title: string; ids: string[] }>>((acc, item) => {
      const key = item.title.toLowerCase();
      acc[key] = acc[key] || { title: item.title, ids: [] };
      acc[key].ids.push(item.id);
      return acc;
    }, {})
  ).filter((g) => g.ids.length > 1);

  async function mergeDuplicates(title: string) {
    "use server";
    const items = await prisma.item.findMany({ where: { userId, classification: ItemClassification.INBOX, title: { equals: title, mode: "insensitive" }, archivedAt: null }, orderBy: { createdAt: "desc" } });
    const [, ...duplicates] = items;
    if (duplicates.length === 0) return;
    const duplicateIds = duplicates.map((i) => i.id);
    await prisma.item.updateMany({
      where: { id: { in: duplicateIds }, userId },
      data: { archivedAt: new Date(), classification: ItemClassification.ARCHIVE },
    });
    redirect("/assist");
  }

  async function pauseProject(id: string) {
    "use server";
    await prisma.project.update({ where: { id, userId }, data: { status: ProjectStatus.PAUSED } });
    await touchProject(userId, id);
    redirect("/assist");
  }

  async function convertCollection(formData: FormData) {
    "use server";
    const collectionId = String(formData.get("collectionId") ?? "");
    if (!collectionId) return;
    await ensureProjectLimit(userId);
    const collection = await prisma.resourceCollection.findUnique({ where: { id: collectionId, userId }, include: { items: true } });
    if (!collection) return;
    const project = await prisma.project.create({ data: { userId, name: collection.name, outcome: collection.description ?? "Outcome TBD", status: ProjectStatus.ACTIVE } });
    if (collection.items.length) {
      await prisma.item.updateMany({ where: { id: { in: collection.items.map((i) => i.id) }, userId }, data: { classification: ItemClassification.PROJECT, projectId: project.id, resourceCollectionId: null } });
    }
    await touchProject(userId, project.id);
    await touchCollection(userId, collectionId);
    redirect("/projects/" + project.id);
  }

  async function addAreaAction(formData: FormData) {
    "use server";
    const areaId = String(formData.get("areaId") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    if (!areaId || !title) return;
    await prisma.item.create({ data: { userId, title, classification: ItemClassification.AREA, type: ItemType.TASK, areaId } });
    await touchArea(userId, areaId);
    redirect("/assist");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Smart Assist</h1>
        <p className="text-sm text-zinc-600">Prompts based on your activity—not chatty AI.</p>
      </div>

      <section className="space-y-3 rounded border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-700">Duplicates</h2>
        <div className="space-y-2">
          {duplicateGroups.map((g) => (
            <div key={g.title} className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 text-sm">
              <div>
                <div className="font-semibold">{g.title}</div>
                <div className="text-xs text-zinc-500">{g.ids.length} inbox items</div>
              </div>
              <form action={() => mergeDuplicates(g.title)}>
                <button className="rounded border px-3 py-1 text-xs">Archive duplicates</button>
              </form>
            </div>
          ))}
          {duplicateGroups.length === 0 && <div className="text-sm text-zinc-500">No duplicates detected this week.</div>}
        </div>
      </section>

      <section className="space-y-3 rounded border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-700">Stale projects</h2>
        <div className="space-y-2">
          {staleProjects.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 text-sm">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-zinc-500">No movement since {p.lastActivityAt.toISOString().slice(0,10)}</div>
              </div>
              <form action={() => pauseProject(p.id)}>
                <button className="rounded border px-3 py-1 text-xs">Pause</button>
              </form>
            </div>
          ))}
          {staleProjects.length === 0 && <div className="text-sm text-zinc-500">All active projects moved in the last 7 days.</div>}
        </div>
      </section>

      <section className="space-y-3 rounded border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-700">Neglected areas</h2>
        <div className="space-y-2">
          {neglectedAreas.map((a) => (
            <div key={a.id} className="space-y-2 rounded border border-zinc-200 px-3 py-2 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-xs text-zinc-500">No new activity since {a.lastActivityAt.toISOString().slice(0,10)}</div>
                </div>
              </div>
              <form action={addAreaAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="areaId" value={a.id} />
                <input name="title" placeholder="Add one action" className="rounded border border-zinc-300 px-2 py-1 flex-1" />
                <button className="rounded border px-3 py-1 text-xs">Add</button>
              </form>
            </div>
          ))}
          {neglectedAreas.length === 0 && <div className="text-sm text-zinc-500">Areas look good.</div>}
        </div>
      </section>

      <section className="space-y-3 rounded border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-700">Resource → Project?</h2>
        <div className="space-y-2">
          {resourceCandidates.filter((c) => c._count.items >= 8).map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 text-sm">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-zinc-500">{c._count.items} items</div>
              </div>
              <form action={convertCollection} className="flex gap-2 items-center">
                <input type="hidden" name="collectionId" value={c.id} />
                <button className="rounded border px-3 py-1 text-xs">Convert to project</button>
              </form>
            </div>
          ))}
          {resourceCandidates.filter((c) => c._count.items >= 8).length === 0 && <div className="text-sm text-zinc-500">No resource collections look like projects yet.</div>}
        </div>
      </section>
    </div>
  );
}
