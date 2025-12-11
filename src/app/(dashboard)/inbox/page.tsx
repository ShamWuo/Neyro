import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification } from "@prisma/client";
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
    if (!title) return;
    await prisma.item.create({ data: { userId, title, details, url, classification: ItemClassification.INBOX } });
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
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">Add to Inbox</button>
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
              <label key={item.id} className="flex items-start gap-3 rounded border border-zinc-200 bg-white/50 p-3 shadow-sm">
                <input type="checkbox" name="selected" value={item.id} className="mt-1" />
                <div>
                  <div className="font-medium">{item.title}</div>
                  {item.details && <p className="text-sm text-zinc-600">{item.details}</p>}
                </div>
              </label>
            ))}
            {items.length === 0 && <div className="text-sm text-zinc-600">Inbox empty. Nice.</div>}
          </div>
        </form>
      </div>
      <div className="text-sm text-zinc-500">Need a new project or area first? Head to <Link href="/projects" className="underline">Projects</Link> or <Link href="/areas" className="underline">Areas</Link>.</div>
    </div>
  );
}
