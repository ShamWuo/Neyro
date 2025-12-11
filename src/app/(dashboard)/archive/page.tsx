import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function ArchivePage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;
  const q = searchParams.q ?? "";

  const [items, projects, areas, collections, activeProjects, activeAreas] = await Promise.all([
    prisma.item.findMany({
      where: {
        userId,
        archivedAt: { not: null },
        title: q ? { contains: q, mode: "insensitive" } : undefined,
      },
      orderBy: { archivedAt: "desc" },
    }),
    prisma.project.findMany({ where: { userId, archivedAt: { not: null } }, orderBy: { archivedAt: "desc" } }),
    prisma.area.findMany({ where: { userId, archivedAt: { not: null } }, orderBy: { archivedAt: "desc" } }),
    prisma.resourceCollection.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
    prisma.project.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
    prisma.area.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
  ]);

  async function restoreItem(formData: FormData) {
    "use server";
    const itemId = String(formData.get("itemId") ?? "");
    const target = String(formData.get("target") ?? "");
    const projectId = String(formData.get("projectId") ?? "");
    const areaId = String(formData.get("areaId") ?? "");
    const collectionId = String(formData.get("collectionId") ?? "");
    if (!itemId) return;
    if (target === "project" && projectId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.PROJECT, projectId, areaId: null, resourceCollectionId: null, archivedAt: null } });
    } else if (target === "area" && areaId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.AREA, areaId, projectId: null, resourceCollectionId: null, archivedAt: null } });
    } else if (target === "resource" && collectionId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.RESOURCE, resourceCollectionId: collectionId, projectId: null, areaId: null, archivedAt: null } });
    } else {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.INBOX, archivedAt: null, projectId: null, areaId: null, resourceCollectionId: null } });
    }
    redirect("/archive");
  }

  async function deleteItem(itemId: string) {
    "use server";
    await prisma.item.delete({ where: { id: itemId, userId } });
    redirect("/archive");
  }

  async function restoreProject(id: string) {
    "use server";
    await prisma.project.update({ where: { id, userId }, data: { archivedAt: null, status: ProjectStatus.PAUSED } });
    redirect("/archive");
  }

  async function restoreArea(id: string) {
    "use server";
    await prisma.area.update({ where: { id, userId }, data: { archivedAt: null } });
    redirect("/archive");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Archive</h1>
        <p className="text-sm text-zinc-600">Find and restore archived items. Use filters to target quickly.</p>
        <form className="flex gap-2" method="get">
          <input name="q" defaultValue={q} placeholder="Search archived titles" className="rounded border border-zinc-300 px-3 py-2 flex-1" />
          <button className="rounded border px-3 py-2">Search</button>
        </form>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-700">Items</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded border border-zinc-200 bg-white p-3 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{item.title}</div>
                  {item.details && <div className="text-sm text-zinc-600">{item.details}</div>}
                  {item.url && <a className="text-xs text-blue-600 underline" href={item.url} target="_blank" rel="noreferrer">{item.url}</a>}
                  <div className="text-xs text-zinc-500">Type: {item.classification}</div>
                </div>
                <form action={() => deleteItem(item.id)}>
                  <button className="text-xs text-red-600">Delete permanently</button>
                </form>
              </div>
              <form action={restoreItem} className="flex flex-wrap gap-2 text-sm items-center">
                <input type="hidden" name="itemId" value={item.id} />
                <label className="flex items-center gap-2">
                  <span>Restore to</span>
                  <select name="target" className="rounded border border-zinc-300 px-2 py-1">
                    <option value="inbox">Inbox</option>
                    <option value="project">Project</option>
                    <option value="area">Area</option>
                    <option value="resource">Resource</option>
                  </select>
                </label>
                <select name="projectId" className="rounded border border-zinc-300 px-2 py-1">
                  <option value="">Project target</option>
                  {activeProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <select name="areaId" className="rounded border border-zinc-300 px-2 py-1">
                  <option value="">Area target</option>
                  {activeAreas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <select name="collectionId" className="rounded border border-zinc-300 px-2 py-1">
                  <option value="">Resource target</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button className="rounded border px-3 py-2">Restore</button>
              </form>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-zinc-500">No archived items.</div>}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-700">Projects</h2>
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="rounded border border-zinc-200 bg-white p-3 shadow-sm flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-zinc-600">Outcome: {p.outcome}</div>
              </div>
              <form action={() => restoreProject(p.id)}>
                <button className="text-sm text-blue-600">Restore</button>
              </form>
            </div>
          ))}
          {projects.length === 0 && <div className="text-sm text-zinc-500">No archived projects.</div>}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-700">Areas</h2>
        <div className="space-y-2">
          {areas.map((a) => (
            <div key={a.id} className="rounded border border-zinc-200 bg-white p-3 shadow-sm flex items-center justify-between">
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-sm text-zinc-600">{a.standard}</div>
              </div>
              <form action={() => restoreArea(a.id)}>
                <button className="text-sm text-blue-600">Restore</button>
              </form>
            </div>
          ))}
          {areas.length === 0 && <div className="text-sm text-zinc-500">No archived areas.</div>}
        </div>
      </section>
    </div>
  );
}
