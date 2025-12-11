import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { touchArea } from "@/lib/para";
import { ItemClassification, ItemType } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AreaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const area = await prisma.area.findUnique({
    where: { id, userId },
    include: {
      items: { where: { classification: ItemClassification.AREA }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!area) redirect("/areas");
  const areaId = area.id;
  const shares = await prisma.shareAccess.findMany({
    where: { ownerId: userId, areaId },
    orderBy: { createdAt: "asc" },
  });

  const [projects, collections] = await Promise.all([
    prisma.project.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
    prisma.resourceCollection.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
  ]);

  async function addShare(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    if (!email) return;
    await prisma.shareAccess.create({ data: { ownerId: userId, areaId, email, permission: "VIEW" } });
    redirect(`/areas/${areaId}`);
  }

  async function updateArea(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const standard = String(formData.get("standard") ?? "").trim();
    if (!name || !standard) return;
    await prisma.area.update({ where: { id: areaId, userId }, data: { name, standard } });
    await touchArea(userId, areaId);
    redirect(`/areas/${areaId}`);
  }

  async function updateReview(formData: FormData) {
    "use server";
    const score = Number(formData.get("score") ?? "");
    const dateRaw = String(formData.get("date") ?? "").trim();
    if (!score || score < 1 || score > 5) return;
    await prisma.area.update({
      where: { id: areaId, userId },
      data: { lastHealthScore: score, lastReviewDate: dateRaw ? new Date(dateRaw) : new Date() },
    });
    await touchArea(userId, areaId);
    redirect(`/areas/${areaId}`);
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
        classification: ItemClassification.AREA,
        areaId,
      },
    });
    await touchArea(userId, areaId);
    redirect(`/areas/${areaId}`);
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
    await touchArea(userId, areaId);
    redirect(`/areas/${areaId}`);
  }

  async function moveItem(formData: FormData) {
    "use server";
    const itemId = String(formData.get("itemId") ?? "");
    const target = String(formData.get("target") ?? "");
    const projectId = String(formData.get("projectId") ?? "").trim() || null;
    const collectionId = String(formData.get("collectionId") ?? "").trim() || null;
    if (!itemId) return;

    if (target === "inbox") {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.INBOX, areaId: null, projectId: null, resourceCollectionId: null, archivedAt: null } });
    } else if (target === "project" && projectId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.PROJECT, projectId, areaId: null, resourceCollectionId: null, archivedAt: null } });
    } else if (target === "resource" && collectionId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.RESOURCE, resourceCollectionId: collectionId, areaId: null, projectId: null, archivedAt: null } });
    } else if (target === "archive") {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.ARCHIVE, archivedAt: new Date(), areaId: null, projectId: null, resourceCollectionId: null } });
    }
    await touchArea(userId, areaId);
    redirect(`/areas/${areaId}`);
  }

  return (
    <div className="space-y-10">
      <div className="panel space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <Link href="/areas" className="text-sm font-medium text-[#0b0d0f]">← Areas</Link>
            <div className="text-xs text-[#555]">Area</div>
            <div className="text-2xl font-semibold tracking-tight text-[#0b0d0f]">{area.name}</div>
            <div className="text-sm text-[#555]">Standard: {area.standard}</div>
            <div className="text-xs text-[#555]">Last score: {area.lastHealthScore ?? "n/a"}</div>
            <div className="text-xs text-[#555]">Last reviewed: {area.lastReviewDate ? area.lastReviewDate.toISOString().slice(0, 10) : "n/a"}</div>
          </div>
          <span className="badge">{area.items.length} items</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#555]">
          <span className="font-medium text-[#0b0d0f]">Share with a partner</span>
          <form action={addShare} className="flex flex-wrap items-center gap-2">
            <input name="email" placeholder="email" className="w-48 border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1" />
            <button className="rounded-md border border-[rgba(0,0,0,0.12)] px-3 py-1 text-xs font-semibold">Share</button>
          </form>
        </div>
        {shares.length > 0 && <div className="text-xs text-[#555]">Shared with: {shares.map((s) => s.email).join(", ")}</div>}

        <form action={updateArea} className="grid gap-3 md:grid-cols-2">
          <input name="name" defaultValue={area.name} className="border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2" required />
          <textarea name="standard" defaultValue={area.standard} className="border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 md:col-span-2" rows={3} required />
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <button type="submit" className="rounded-md border border-[#0b0d0f] bg-[#0b0d0f] px-4 py-2 text-sm font-semibold text-white">Save area</button>
          </div>
        </form>

        <form action={updateReview} className="flex flex-wrap gap-3 text-sm items-center">
          <label className="flex items-center gap-2">Score
            <select name="score" defaultValue={area.lastHealthScore ?? ""} className="border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1">
              <option value="">Set</option>
              {[1,2,3,4,5].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2">Date
            <input name="date" type="date" defaultValue={area.lastReviewDate ? area.lastReviewDate.toISOString().slice(0,10) : ""} className="border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1" />
          </label>
          <button type="submit" className="rounded-md border border-[rgba(0,0,0,0.12)] px-3 py-2 text-sm font-semibold">Update review</button>
        </form>
      </div>

      <div className="panel space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0b0d0f]">Items in this area</h2>
          <span className="text-xs text-[#555]">{area.items.length} items</span>
        </div>
        <div className="space-y-3">
          {area.items.map((item) => (
            <div key={item.id} className="rounded border border-[rgba(0,0,0,0.06)] bg-[#f8f9fa] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-[#0b0d0f]">{item.title}</div>
                <span className="text-xs text-[#555]">{item.type}</span>
              </div>
              {item.details && <div className="text-sm text-[#555]">{item.details}</div>}
              {item.url && <a href={item.url} className="text-xs font-medium text-[#0f172a] underline" target="_blank" rel="noreferrer">{item.url}</a>}
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
                  <option value="inbox">Inbox</option>
                  <option value="project">Project</option>
                  <option value="resource">Resource</option>
                  <option value="archive">Archive</option>
                </select>
                <select name="projectId" className="border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1">
                  <option value="">Project target</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select name="collectionId" className="border border-[rgba(0,0,0,0.12)] bg-white px-2 py-1">
                  <option value="">Resource target</option>
                  {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="submit" className="rounded-md border border-[rgba(0,0,0,0.12)] px-3 py-2 text-sm font-semibold">Apply</button>
              </form>
            </div>
          ))}
          {area.items.length === 0 && <div className="text-sm text-[#555]">No items in this area.</div>}
        </div>
      </div>

      <div className="panel space-y-3">
        <h2 className="text-sm font-semibold text-[#0b0d0f]">Add next action</h2>
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

      <div className="text-sm text-[#555]"><Link href="/areas" className="underline">Back to areas</Link></div>
    </div>
  );
}
