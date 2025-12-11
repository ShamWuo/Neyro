import { auth } from "@/auth";
import { ensureProjectLimit, getActiveProjectCount } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ItemType, ProjectStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;
  const project = await prisma.project.findUnique({
    where: { id: params.id, userId },
    include: {
      items: {
        where: { classification: ItemClassification.PROJECT },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!project) redirect("/projects");

  const [activeCount, areas, collections] = await Promise.all([
    getActiveProjectCount(userId),
    prisma.area.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
    prisma.resourceCollection.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
  ]);

  async function updateProject(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const outcome = String(formData.get("outcome") ?? "").trim();
    const deadlineRaw = String(formData.get("deadline") ?? "").trim();
    if (!name || !outcome) return;
    await prisma.project.update({
      where: { id: project.id, userId },
      data: { name, outcome, deadline: deadlineRaw ? new Date(deadlineRaw) : null },
    });
    redirect(`/projects/${project.id}`);
  }

  async function changeStatus(status: ProjectStatus) {
    "use server";
    if (status === ProjectStatus.ACTIVE) {
      await ensureProjectLimit(userId);
    }
    await prisma.project.update({ where: { id: project.id, userId }, data: { status } });
    redirect(`/projects/${project.id}`);
  }

  async function archiveProject() {
    "use server";
    await prisma.project.update({ where: { id: project.id, userId }, data: { archivedAt: new Date(), status: ProjectStatus.COMPLETED } });
    redirect("/projects");
  }

  async function addItem(formData: FormData) {
    "use server";
    const title = String(formData.get("title") ?? "").trim();
    const details = String(formData.get("details") ?? "").trim() || null;
    const url = String(formData.get("url") ?? "").trim() || null;
    const type = (String(formData.get("type") ?? ItemType.NOTE) as ItemType) || ItemType.NOTE;
    if (!title) return;
    await prisma.item.create({
      data: {
        userId,
        title,
        details,
        url,
        type,
        classification: ItemClassification.PROJECT,
        projectId: project.id,
      },
    });
    redirect(`/projects/${project.id}`);
  }

  async function toggleDone(itemId: string, done: boolean) {
    "use server";
    await prisma.item.update({ where: { id: itemId, userId }, data: { isDone: done } });
    redirect(`/projects/${project.id}`);
  }

  async function updateItem(formData: FormData) {
    "use server";
    const itemId = String(formData.get("itemId") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const details = String(formData.get("details") ?? "").trim() || null;
    const url = String(formData.get("url") ?? "").trim() || null;
    const type = String(formData.get("type") ?? ItemType.NOTE) as ItemType;
    if (!itemId || !title) return;
    await prisma.item.update({
      where: { id: itemId, userId },
      data: { title, details, url, type },
    });
    redirect(`/projects/${project.id}`);
  }

  async function moveItem(formData: FormData) {
    "use server";
    const itemId = String(formData.get("itemId") ?? "");
    const target = String(formData.get("target") ?? "");
    const areaId = String(formData.get("areaId") ?? "").trim() || null;
    const collectionId = String(formData.get("collectionId") ?? "").trim() || null;
    if (!itemId) return;

    if (target === "inbox") {
      await prisma.item.update({
        where: { id: itemId, userId },
        data: { classification: ItemClassification.INBOX, projectId: null, areaId: null, resourceCollectionId: null, archivedAt: null },
      });
    } else if (target === "area" && areaId) {
      await prisma.item.update({
        where: { id: itemId, userId },
        data: { classification: ItemClassification.AREA, areaId, projectId: null, resourceCollectionId: null, archivedAt: null },
      });
    } else if (target === "resource" && collectionId) {
      await prisma.item.update({
        where: { id: itemId, userId },
        data: { classification: ItemClassification.RESOURCE, resourceCollectionId: collectionId, projectId: null, areaId: null, archivedAt: null },
      });
    } else if (target === "archive") {
      await prisma.item.update({
        where: { id: itemId, userId },
        data: { classification: ItemClassification.ARCHIVE, archivedAt: new Date(), projectId: null, areaId: null, resourceCollectionId: null },
      });
    }
    redirect(`/projects/${project.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-zinc-500">Project</div>
            <div className="text-xl font-semibold">{project.name}</div>
            <div className="text-sm text-zinc-600">Outcome: {project.outcome}</div>
            <div className="text-xs text-zinc-500">Status: {project.status}</div>
            <div className="text-xs text-zinc-500">Active projects: {activeCount}/7</div>
          </div>
          <div className="flex gap-2 text-sm">
            <form action={() => changeStatus(ProjectStatus.ACTIVE)}><button className="rounded border px-3 py-2">Set active</button></form>
            <form action={() => changeStatus(ProjectStatus.PAUSED)}><button className="rounded border px-3 py-2">Pause</button></form>
            <form action={() => changeStatus(ProjectStatus.COMPLETED)}><button className="rounded border px-3 py-2">Complete</button></form>
            {project.status === ProjectStatus.COMPLETED && (
              <form action={archiveProject}><button className="rounded border px-3 py-2 text-red-600">Move to archive</button></form>
            )}
          </div>
        </div>
        <form action={updateProject} className="grid gap-3 md:grid-cols-2">
          <input name="name" defaultValue={project.name} placeholder="Name" className="rounded border border-zinc-300 px-3 py-2" required />
          <input name="outcome" defaultValue={project.outcome} placeholder="Outcome" className="rounded border border-zinc-300 px-3 py-2 md:col-span-2" required />
          <label className="text-sm text-zinc-600 flex flex-col">
            Deadline
            <input name="deadline" type="date" defaultValue={project.deadline ? project.deadline.toISOString().slice(0, 10) : ""} className="rounded border border-zinc-300 px-3 py-2" />
          </label>
          <button type="submit" className="rounded bg-black px-4 py-2 text-white md:col-span-2">Save project</button>
        </form>
      </div>

      <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">Items in this project</h2>
          <span className="text-xs text-zinc-500">{project.items.length} items</span>
        </div>
        <div className="space-y-3">
          {project.items.map((item) => (
            <div key={item.id} className="rounded border border-zinc-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{item.title}</div>
                  {item.details && <div className="text-sm text-zinc-600">{item.details}</div>}
                  {item.url && <a href={item.url} className="text-xs text-blue-600 underline" target="_blank" rel="noreferrer">{item.url}</a>}
                  <div className="text-xs text-zinc-500">Type: {item.type}</div>
                </div>
                <form action={() => toggleDone(item.id, !item.isDone)}>
                  <button className="text-xs rounded border px-2 py-1">{item.isDone ? "Mark undone" : "Mark done"}</button>
                </form>
              </div>
              <form action={updateItem} className="grid gap-2 md:grid-cols-2">
                <input type="hidden" name="itemId" value={item.id} />
                <input name="title" defaultValue={item.title} className="rounded border border-zinc-300 px-2 py-1" required />
                <select name="type" defaultValue={item.type} className="rounded border border-zinc-300 px-2 py-1">
                  {Object.values(ItemType).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <textarea name="details" defaultValue={item.details ?? ""} rows={2} className="rounded border border-zinc-300 px-2 py-1 md:col-span-2" />
                <input name="url" defaultValue={item.url ?? ""} placeholder="URL" className="rounded border border-zinc-300 px-2 py-1 md:col-span-2" />
                <button type="submit" className="rounded bg-black px-3 py-2 text-white md:col-span-2 text-sm">Save item</button>
              </form>
              <form action={moveItem} className="flex flex-wrap gap-2 text-sm">
                <input type="hidden" name="itemId" value={item.id} />
                <select name="target" className="rounded border border-zinc-300 px-2 py-1" required>
                  <option value="">Move to...</option>
                  <option value="inbox">Inbox</option>
                  <option value="area">Area</option>
                  <option value="resource">Resource</option>
                  <option value="archive">Archive</option>
                </select>
                <select name="areaId" className="rounded border border-zinc-300 px-2 py-1">
                  <option value="">Area target</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <select name="collectionId" className="rounded border border-zinc-300 px-2 py-1">
                  <option value="">Resource target</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button type="submit" className="rounded border px-3 py-2">Apply</button>
              </form>
            </div>
          ))}
          {project.items.length === 0 && <div className="text-sm text-zinc-500">No items yet.</div>}
        </div>
      </div>

      <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-zinc-700">Add item to this project</h2>
        <form action={addItem} className="grid gap-3 md:grid-cols-2">
          <input name="title" placeholder="Title" className="rounded border border-zinc-300 px-3 py-2 md:col-span-2" required />
          <textarea name="details" placeholder="Details" className="rounded border border-zinc-300 px-3 py-2 md:col-span-2" rows={3} />
          <input name="url" placeholder="URL (optional)" className="rounded border border-zinc-300 px-3 py-2 md:col-span-2" />
          <select name="type" className="rounded border border-zinc-300 px-3 py-2 md:col-span-2" defaultValue={ItemType.NOTE}>
            {Object.values(ItemType).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button type="submit" className="rounded bg-black px-4 py-2 text-white md:col-span-2">Add item</button>
        </form>
      </div>

      <div className="text-sm text-zinc-500"><Link href="/projects" className="underline">Back to projects</Link></div>
    </div>
  );
}
