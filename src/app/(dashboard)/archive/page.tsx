import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function ArchivePage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;
  const { q = "" } = (await searchParams) ?? {};

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
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Archive</h1>
        <p className="text-sm text-[#555]">Find and restore archived items quickly with filters.</p>
        <form className="flex gap-2" method="get">
          <input name="q" defaultValue={q} placeholder="Search archived titles" className="flex-1 border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2" />
          <button className="rounded-md border border-[#0b0d0f] bg-[#0b0d0f] px-3 py-2 text-sm font-semibold text-white">Search</button>
        </form>
      </div>

      <section className="panel space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0b0d0f]">Items</h2>
          <span className="text-xs text-[#555]">{items.length} archived</span>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded border border-[rgba(0,0,0,0.06)] bg-[#f8f9fa] p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-medium text-[#0b0d0f]">{item.title}</div>
                  {item.details && <div className="text-sm text-[#555]">{item.details}</div>}
                  {item.url && <a className="text-xs font-semibold text-[#0f172a] underline" href={item.url} target="_blank" rel="noreferrer">{item.url}</a>}
                  <div className="text-xs text-[#555]">Type: {item.classification}</div>
                </div>
                <form action={() => deleteItem(item.id)}>
                  <button className="text-xs font-semibold text-red-600">Delete permanently</button>
                </form>
              </div>
              <form action={restoreItem} className="flex flex-wrap gap-2 text-sm items-center">
                <input type="hidden" name="itemId" value={item.id} />
                <label className="flex items-center gap-2">
                  <span>Restore to</span>
                  <select name="target" className="border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1">
                    <option value="inbox">Inbox</option>
                    <option value="project">Project</option>
                    <option value="area">Area</option>
                    <option value="resource">Resource</option>
                  </select>
                </label>
                <select name="projectId" className="border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1">
                  <option value="">Project target</option>
                  {activeProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <select name="areaId" className="border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1">
                  <option value="">Area target</option>
                  {activeAreas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <select name="collectionId" className="border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1">
                  <option value="">Resource target</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button className="rounded-md border border-[rgba(0,0,0,0.12)] px-3 py-2 text-sm font-semibold">Restore</button>
              </form>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-[#555]">No archived items.</div>}
        </div>
      </section>

      <section className="panel space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0b0d0f]">Projects</h2>
          <span className="text-xs text-[#555]">{projects.length} archived</span>
        </div>
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="rounded border border-[rgba(0,0,0,0.06)] bg-[#f8f9fa] p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium text-[#0b0d0f]">{p.name}</div>
                <div className="text-sm text-[#555]">Outcome: {p.outcome}</div>
              </div>
              <form action={() => restoreProject(p.id)}>
                <button className="text-sm font-semibold text-[#0f172a]">Restore</button>
              </form>
            </div>
          ))}
          {projects.length === 0 && <div className="text-sm text-[#555]">No archived projects.</div>}
        </div>
      </section>

      <section className="panel space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0b0d0f]">Areas</h2>
          <span className="text-xs text-[#555]">{areas.length} archived</span>
        </div>
        <div className="space-y-2">
          {areas.map((a) => (
            <div key={a.id} className="rounded border border-[rgba(0,0,0,0.06)] bg-[#f8f9fa] p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium text-[#0b0d0f]">{a.name}</div>
                <div className="text-sm text-[#555]">{a.standard}</div>
              </div>
              <form action={() => restoreArea(a.id)}>
                <button className="text-sm font-semibold text-[#0f172a]">Restore</button>
              </form>
            </div>
          ))}
          {areas.length === 0 && <div className="text-sm text-[#555]">No archived areas.</div>}
        </div>
      </section>
    </div>
  );
}
