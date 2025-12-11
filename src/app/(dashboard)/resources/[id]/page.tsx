import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { touchCollection } from "@/lib/para";
import { ItemClassification, ItemType } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const collection = await prisma.resourceCollection.findUnique({
    where: { id, userId },
    include: { items: { where: { classification: ItemClassification.RESOURCE }, orderBy: { createdAt: "desc" } } },
  });
  if (!collection) redirect("/resources");
  const collectionId = collection.id;

  const [projects, areas, collections] = await Promise.all([
    prisma.project.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
    prisma.area.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
    prisma.resourceCollection.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
  ]);

  async function updateCollection(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim() || null;
    if (!name) return;
    await prisma.resourceCollection.update({ where: { id: collectionId, userId }, data: { name, description } });
    await touchCollection(userId, collectionId);
    redirect(`/resources/${collectionId}`);
  }

  async function deleteCollection() {
    "use server";
    await prisma.resourceCollection.delete({ where: { id: collectionId, userId } });
    redirect("/resources");
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
        classification: ItemClassification.RESOURCE,
        resourceCollectionId: collectionId,
      },
    });
    await touchCollection(userId, collectionId);
    redirect(`/resources/${collectionId}`);
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
    await touchCollection(userId, collectionId);
    redirect(`/resources/${collectionId}`);
  }

  async function moveItem(formData: FormData) {
    "use server";
    const itemId = String(formData.get("itemId") ?? "");
    const target = String(formData.get("target") ?? "");
    const projectId = String(formData.get("projectId") ?? "").trim() || null;
    const areaId = String(formData.get("areaId") ?? "").trim() || null;
    const destinationCollectionId = String(formData.get("collectionId") ?? "").trim() || null;
    if (!itemId) return;

    if (target === "project" && projectId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.PROJECT, projectId, resourceCollectionId: null, areaId: null, archivedAt: null } });
    } else if (target === "area" && areaId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.AREA, areaId, projectId: null, resourceCollectionId: null, archivedAt: null } });
    } else if (target === "collection" && destinationCollectionId) {
      await prisma.item.update({
        where: { id: itemId, userId },
        data: { classification: ItemClassification.RESOURCE, resourceCollectionId: destinationCollectionId, projectId: null, areaId: null, archivedAt: null },
      });
    } else if (target === "archive") {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.ARCHIVE, archivedAt: new Date(), resourceCollectionId: null, projectId: null, areaId: null } });
    }
    await touchCollection(userId, collectionId);
    redirect(`/resources/${collectionId}`);
  }

  return (
    <div className="space-y-10">
      <div className="panel space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[#555]">Collection</div>
            <div className="text-2xl font-semibold tracking-tight text-[#0b0d0f]">{collection.name}</div>
            {collection.description && <div className="text-sm text-[#555]">{collection.description}</div>}
          </div>
          <form action={deleteCollection}>
            <button className="text-sm font-semibold text-red-600 underline" type="submit">Delete</button>
          </form>
        </div>
        <form action={updateCollection} className="grid gap-3 md:grid-cols-2">
          <input name="name" defaultValue={collection.name} className="border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2" required />
          <textarea name="description" defaultValue={collection.description ?? ""} className="border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 md:col-span-2" rows={3} />
          <button type="submit" className="rounded-md border border-[#0b0d0f] bg-[#0b0d0f] px-4 py-2 text-sm font-semibold text-white md:col-span-2">Save collection</button>
        </form>
      </div>

      <div className="panel space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0b0d0f]">Items</h2>
          <span className="text-xs text-[#555]">{collection.items.length} items</span>
        </div>
        <div className="space-y-3">
          {collection.items.map((item) => (
            <div key={item.id} className="rounded border border-[rgba(0,0,0,0.06)] bg-[#f8f9fa] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-[#0b0d0f]">{item.title}</div>
                <span className="text-xs text-[#555]">{item.type}</span>
              </div>
              {item.details && <div className="text-sm text-[#555]">{item.details}</div>}
              {item.url && <a href={item.url} className="text-xs font-semibold text-[#0f172a] underline" target="_blank" rel="noreferrer">{item.url}</a>}
              <form action={updateItem} className="grid gap-2 md:grid-cols-2">
                <input type="hidden" name="itemId" value={item.id} />
                <input name="title" defaultValue={item.title} className="border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1" required />
                <select name="type" defaultValue={item.type} className="border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1">
                  {Object.values(ItemType).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <textarea name="details" defaultValue={item.details ?? ""} rows={2} className="border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1 md:col-span-2" />
                <input name="url" defaultValue={item.url ?? ""} placeholder="URL" className="border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1 md:col-span-2" />
                <button type="submit" className="rounded-md border border-[#0b0d0f] bg-[#0b0d0f] px-3 py-2 text-sm font-semibold text-white md:col-span-2">Save item</button>
              </form>
              <form action={moveItem} className="flex flex-wrap gap-2 text-sm">
                <input type="hidden" name="itemId" value={item.id} />
                <select name="target" className="border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1" required>
                  <option value="">Move to...</option>
                  <option value="project">Project</option>
                  <option value="area">Area</option>
                  <option value="collection">Another collection</option>
                  <option value="archive">Archive</option>
                </select>
                <select name="projectId" className="border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1">
                  <option value="">Project target</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select name="areaId" className="border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1">
                  <option value="">Area target</option>
                  {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <select name="collectionId" className="border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1">
                  <option value="">Collection target</option>
                  {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="submit" className="rounded-md border border-[rgba(0,0,0,0.12)] px-3 py-2 text-sm font-semibold">Apply</button>
              </form>
            </div>
          ))}
          {collection.items.length === 0 && <div className="text-sm text-[#555]">No items in this collection.</div>}
        </div>
      </div>

      <div className="panel space-y-3">
        <h2 className="text-sm font-semibold text-[#0b0d0f]">Add resource item</h2>
        <form action={addItem} className="grid gap-3 md:grid-cols-2">
          <input name="title" placeholder="Title" className="border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 md:col-span-2" required />
          <textarea name="details" placeholder="Details" className="border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 md:col-span-2" rows={3} />
          <input name="url" placeholder="URL (optional)" className="border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 md:col-span-2" />
          <select name="type" className="border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 md:col-span-2" defaultValue={ItemType.NOTE}>
            {Object.values(ItemType).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button type="submit" className="rounded-md border border-[#0b0d0f] bg-[#0b0d0f] px-4 py-2 text-sm font-semibold text-white md:col-span-2">Add item</button>
        </form>
      </div>

      <div className="text-sm text-[#555]"><Link href="/resources" className="underline">Back to resources</Link></div>
    </div>
  );
}
