import { auth } from "@/auth";
import { ensureProjectLimit } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ItemType, ProjectStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const [items, projects, areas, collections] = await Promise.all([
    prisma.item.findMany({ where: { userId, classification: ItemClassification.INBOX, archivedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.project.findMany({ where: { userId, archivedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.area.findMany({ where: { userId, archivedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.resourceCollection.findMany({ where: { userId, archivedAt: null }, orderBy: { createdAt: "desc" } }),
  ]);

  async function createItem(formData: FormData) {
    "use server";
    const title = String(formData.get("title") ?? "").trim();
    const details = String(formData.get("details") ?? "").trim() || null;
    const url = String(formData.get("url") ?? "").trim() || null;
    const type = (String(formData.get("type") ?? ItemType.NOTE) as ItemType) || ItemType.NOTE;
    if (!title) return;
    await prisma.item.create({ data: { userId, title, details, url, type, classification: ItemClassification.INBOX } });
  }

  async function updateItem(formData: FormData) {
    "use server";
    const itemId = String(formData.get("itemId") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const details = String(formData.get("details") ?? "").trim() || null;
    const url = String(formData.get("url") ?? "").trim() || null;
    const type = String(formData.get("type") ?? ItemType.NOTE) as ItemType;
    if (!itemId || !title) return;
    await prisma.item.update({ where: { id: itemId, userId }, data: { title, details, url, type } });
    redirect("/inbox");
  }

  async function deleteItem(itemId: string) {
    "use server";
    await prisma.item.delete({ where: { id: itemId, userId } });
    redirect("/inbox");
  }

  async function archiveItem(itemId: string) {
    "use server";
    await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.ARCHIVE, archivedAt: new Date(), projectId: null, areaId: null, resourceCollectionId: null } });
    redirect("/inbox");
  }

  async function moveToProject(formData: FormData) {
    "use server";
    const itemId = String(formData.get("itemId") ?? "");
    const projectIdRaw = String(formData.get("projectId") ?? "");
    const newName = String(formData.get("newProjectName") ?? "").trim();
    const newOutcome = String(formData.get("newProjectOutcome") ?? "").trim();
    const newDeadline = String(formData.get("newProjectDeadline") ?? "").trim();
    let projectId = projectIdRaw || null;

    if (!projectId && newName && newOutcome) {
      await ensureProjectLimit(userId);
      const created = await prisma.project.create({
        data: { userId, name: newName, outcome: newOutcome, deadline: newDeadline ? new Date(newDeadline) : null, status: ProjectStatus.ACTIVE },
      });
      projectId = created.id;
    }

    if (!itemId || !projectId) return;
    await prisma.item.update({
      where: { id: itemId, userId },
      data: { classification: ItemClassification.PROJECT, projectId, areaId: null, resourceCollectionId: null, archivedAt: null },
    });
    redirect("/inbox");
  }

  async function moveToArea(formData: FormData) {
    "use server";
    const itemId = String(formData.get("itemId") ?? "");
    const areaIdRaw = String(formData.get("areaId") ?? "");
    const newName = String(formData.get("newAreaName") ?? "").trim();
    const newStandard = String(formData.get("newAreaStandard") ?? "").trim();
    let areaId = areaIdRaw || null;

    if (!areaId && newName && newStandard) {
      const created = await prisma.area.create({ data: { userId, name: newName, standard: newStandard } });
      areaId = created.id;
    }

    if (!itemId || !areaId) return;
    await prisma.item.update({
      where: { id: itemId, userId },
      data: { classification: ItemClassification.AREA, areaId, projectId: null, resourceCollectionId: null, archivedAt: null },
    });
    redirect("/inbox");
  }

  async function moveToResource(formData: FormData) {
    "use server";
    const itemId = String(formData.get("itemId") ?? "");
    const collectionIdRaw = String(formData.get("collectionId") ?? "");
    const newName = String(formData.get("newCollectionName") ?? "").trim();
    let collectionId = collectionIdRaw || null;
    if (!collectionId && newName) {
      const created = await prisma.resourceCollection.create({ data: { userId, name: newName } });
      collectionId = created.id;
    }
    if (!itemId || !collectionId) return;
    await prisma.item.update({
      where: { id: itemId, userId },
      data: { classification: ItemClassification.RESOURCE, resourceCollectionId: collectionId, projectId: null, areaId: null, archivedAt: null },
    });
    redirect("/inbox");
  }

  async function bulkClassify(formData: FormData) {
    "use server";
    const selected = formData.getAll("selected").map(String).filter(Boolean);
    if (!selected.length) return;

    const classificationRaw = String(formData.get("classification") ?? "").trim();
    const classification = classificationRaw as ItemClassification;

    let data: {
      classification: ItemClassification;
      projectId?: string | null;
      areaId?: string | null;
      resourceCollectionId?: string | null;
      archivedAt?: Date | null;
    } | null = null;

    if (classification === ItemClassification.PROJECT) {
      const projectId = String(formData.get("projectId") ?? "").trim();
      if (!projectId) return;
      data = { classification: ItemClassification.PROJECT, projectId, areaId: null, resourceCollectionId: null, archivedAt: null };
    } else if (classification === ItemClassification.AREA) {
      const areaId = String(formData.get("areaId") ?? "").trim();
      if (!areaId) return;
      data = { classification: ItemClassification.AREA, areaId, projectId: null, resourceCollectionId: null, archivedAt: null };
    } else if (classification === ItemClassification.RESOURCE) {
      const resourceCollectionId = String(formData.get("resourceCollectionId") ?? "").trim();
      if (!resourceCollectionId) return;
      data = { classification: ItemClassification.RESOURCE, resourceCollectionId, areaId: null, projectId: null, archivedAt: null };
    } else if (classification === ItemClassification.ARCHIVE) {
      const confirmArchive = String(formData.get("confirmArchive") ?? "");
      if (confirmArchive !== "on") {
        throw new Error("Confirm archive before applying.");
      }
      data = { classification: ItemClassification.ARCHIVE, archivedAt: new Date(), projectId: null, areaId: null, resourceCollectionId: null };
    } else if (classification === ItemClassification.INBOX) {
      data = { classification: ItemClassification.INBOX, projectId: null, areaId: null, resourceCollectionId: null, archivedAt: null };
    }

    if (!data) return;

    await prisma.item.updateMany({
      where: { id: { in: selected }, userId },
      data,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Inbox</h1>
        <p className="text-sm text-zinc-600">Capture quickly, then classify out of Inbox.</p>
      </div>

      <form action={createItem} className="space-y-3 rounded border border-zinc-200 bg-white p-4 shadow-sm">
        <input name="title" placeholder="Title" className="w-full rounded border border-zinc-300 px-3 py-2" required />
        <textarea name="details" placeholder="Details" className="w-full rounded border border-zinc-300 px-3 py-2" rows={3} />
        <input name="url" placeholder="URL (optional)" className="w-full rounded border border-zinc-300 px-3 py-2" />
        <select name="type" className="w-full rounded border border-zinc-300 px-3 py-2" defaultValue={ItemType.NOTE}>
          {Object.values(ItemType).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">Add to Inbox</button>
        <div className="text-xs text-zinc-500">Everything starts here. You’ll classify it later.</div>
      </form>

      <div className="space-y-4">
        <div className="text-sm text-zinc-600">{items.length} items</div>

        <form action={bulkClassify} className="space-y-3 rounded border border-zinc-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-3 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-zinc-700">Classification</span>
              <select name="classification" className="rounded border border-zinc-300 px-2 py-1" required>
                <option value="">Select</option>
                <option value={ItemClassification.PROJECT}>Project</option>
                <option value={ItemClassification.AREA}>Area</option>
                <option value={ItemClassification.RESOURCE}>Resource</option>
                <option value={ItemClassification.INBOX}>Inbox</option>
                <option value={ItemClassification.ARCHIVE}>Archive</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-zinc-700">Project</span>
              <select name="projectId" className="rounded border border-zinc-300 px-2 py-1">
                <option value="">Select</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-zinc-700">Area</span>
              <select name="areaId" className="rounded border border-zinc-300 px-2 py-1">
                <option value="">Select</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-zinc-700">Resource</span>
              <select name="resourceCollectionId" className="rounded border border-zinc-300 px-2 py-1">
                <option value="">Select</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-red-600">
              <input type="checkbox" name="confirmArchive" className="h-4 w-4" />
              <span className="text-xs">Confirm archive for bulk moves</span>
            </label>
          </div>
          <button type="submit" className="rounded bg-black px-3 py-2 text-white text-sm">
            Apply to selected
          </button>
          <div className="text-xs text-zinc-500">Targets are required for Project/Area/Resource. Use Archive or Inbox to clear without targets.</div>

          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="rounded border border-zinc-200 bg-white/50 p-3 shadow-sm space-y-2">
                <label className="flex items-start gap-3">
                  <input type="checkbox" name="selected" value={item.id} className="mt-1" />
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    {item.details && <p className="text-sm text-zinc-600 line-clamp-2">{item.details}</p>}
                    {item.url && (
                      <a href={item.url} className="text-xs text-blue-600 underline" target="_blank" rel="noreferrer">{item.url}</a>
                    )}
                    <div className="text-xs text-zinc-500">Type: {item.type} · Created {item.createdAt.toISOString().slice(0, 10)}</div>
                  </div>
                </label>

                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  <form action={moveToProject} className="space-y-2 rounded border border-zinc-200 p-2 text-sm">
                    <input type="hidden" name="itemId" value={item.id} />
                    <div className="font-semibold text-xs text-zinc-700">Move to project</div>
                    <select name="projectId" className="w-full rounded border border-zinc-300 px-2 py-1">
                      <option value="">Select project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <input name="newProjectName" placeholder="New project name" className="w-full rounded border border-zinc-300 px-2 py-1" />
                    <input name="newProjectOutcome" placeholder="Outcome" className="w-full rounded border border-zinc-300 px-2 py-1" />
                    <input name="newProjectDeadline" type="date" className="w-full rounded border border-zinc-300 px-2 py-1" />
                    <button className="rounded border px-2 py-1">Move</button>
                  </form>

                  <form action={moveToArea} className="space-y-2 rounded border border-zinc-200 p-2 text-sm">
                    <input type="hidden" name="itemId" value={item.id} />
                    <div className="font-semibold text-xs text-zinc-700">Move to area</div>
                    <select name="areaId" className="w-full rounded border border-zinc-300 px-2 py-1">
                      <option value="">Select area</option>
                      {areas.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    <input name="newAreaName" placeholder="New area name" className="w-full rounded border border-zinc-300 px-2 py-1" />
                    <input name="newAreaStandard" placeholder="Standard" className="w-full rounded border border-zinc-300 px-2 py-1" />
                    <button className="rounded border px-2 py-1">Move</button>
                  </form>

                  <form action={moveToResource} className="space-y-2 rounded border border-zinc-200 p-2 text-sm">
                    <input type="hidden" name="itemId" value={item.id} />
                    <div className="font-semibold text-xs text-zinc-700">Save as resource</div>
                    <select name="collectionId" className="w-full rounded border border-zinc-300 px-2 py-1">
                      <option value="">Select collection</option>
                      {collections.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <input name="newCollectionName" placeholder="New collection name" className="w-full rounded border border-zinc-300 px-2 py-1" />
                    <button className="rounded border px-2 py-1">Save</button>
                  </form>
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                  <form action={() => archiveItem(item.id)}>
                    <button className="rounded border px-3 py-1 text-red-600">Archive</button>
                  </form>
                  <form action={() => deleteItem(item.id)}>
                    <button className="rounded border px-3 py-1">Delete</button>
                  </form>
                </div>

                <details className="rounded border border-dashed border-zinc-300 p-2 text-sm">
                  <summary className="cursor-pointer text-xs text-zinc-700">Edit item</summary>
                  <form action={updateItem} className="space-y-2 mt-2">
                    <input type="hidden" name="itemId" value={item.id} />
                    <input name="title" defaultValue={item.title} className="w-full rounded border border-zinc-300 px-2 py-1" required />
                    <select name="type" defaultValue={item.type} className="w-full rounded border border-zinc-300 px-2 py-1">
                      {Object.values(ItemType).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <textarea name="details" defaultValue={item.details ?? ""} rows={2} className="w-full rounded border border-zinc-300 px-2 py-1" />
                    <input name="url" defaultValue={item.url ?? ""} placeholder="URL" className="w-full rounded border border-zinc-300 px-2 py-1" />
                    <button className="rounded bg-black px-3 py-2 text-white" type="submit">Save</button>
                  </form>
                </details>
              </div>
            ))}
            {items.length === 0 && <div className="text-sm text-zinc-600">Inbox empty. Nice.</div>}
          </div>
        </form>
      </div>
      <div className="text-sm text-zinc-500">Need a new project or area first? Head to <Link href="/projects" className="underline">Projects</Link> or <Link href="/areas" className="underline">Areas</Link>.</div>
    </div>
  );
}
