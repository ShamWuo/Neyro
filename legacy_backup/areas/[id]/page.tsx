import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ItemType } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { LoadingState } from "@/components/loading-state";
import { addShare, updateArea, updateReview, addItem, updateItem, moveItem } from "./actions";

// Code splitting: Load chart component dynamically (heavy visualization)
const AreaHealthChart = dynamic(
  () => import("@/components/area-health-chart").then((mod) => ({ default: mod.AreaHealthChart })),
  {
    loading: () => <LoadingState type="card" />,
    ssr: true,
  }
);

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

  const [projects, collections, reviews] = await Promise.all([
    prisma.project.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
    prisma.resourceCollection.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
    prisma.weeklyReview.findMany({
      where: { userId, areaHealthAverage: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 12,
    }),
  ]);

  // Create bound action functions
  const addShareAction = (formData: FormData) => addShare(areaId, formData);
  const updateAreaAction = (formData: FormData) => updateArea(areaId, formData);
  const updateReviewAction = (formData: FormData) => updateReview(areaId, formData);
  const addItemAction = (formData: FormData) => addItem(areaId, formData);
  const updateItemAction = (formData: FormData) => updateItem(areaId, formData);
  const moveItemAction = (formData: FormData) => moveItem(areaId, formData);

  return (
    <div className="space-y-10">
      <div className="panel space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <Link href="/areas" className="text-sm font-medium text-[var(--text-primary)]">← Areas</Link>
            <div className="text-xs text-[var(--text-secondary)]">Area</div>
            <div className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{area.name}</div>
            <div className="text-sm text-[var(--text-secondary)]">Standard: {area.standard}</div>
            <div className="text-xs text-[var(--text-secondary)]">Last score: {area.lastHealthScore ?? "n/a"}</div>
            <div className="text-xs text-[var(--text-secondary)]">Last reviewed: {area.lastReviewDate ? area.lastReviewDate.toISOString().slice(0, 10) : "n/a"}</div>
          </div>
          <span className="badge">{area.items.length} items</span>
        </div>

        <AreaHealthChart
          areaName={area.name}
          reviews={reviews}
          currentScore={area.lastHealthScore}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">Share with a partner</span>
          <form action={addShareAction} className="flex flex-wrap items-center gap-2">
            <label htmlFor="share-email" className="sr-only">
              Partner email address
            </label>
            <input 
              id="share-email"
              name="email" 
              type="email"
              placeholder="email" 
              aria-label="Partner email address"
              required
              aria-required="true"
              className="w-48 border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 text-[var(--text-primary)]" 
            />
            <button 
              type="submit"
              className="rounded-md border border-[var(--border-default)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] transition"
            >
              Share
            </button>
          </form>
        </div>
        {shares.length > 0 && <div className="text-xs text-[var(--text-secondary)]">Shared with: {shares.map((s) => s.email).join(", ")}</div>}

        <form action={updateAreaAction} className="grid gap-3 md:grid-cols-2">
          <input name="name" defaultValue={area.name} className="border border-[var(--border-default)] bg-[var(--card)] px-3 py-2" required />
          <textarea name="standard" defaultValue={area.standard} className="border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 md:col-span-2" rows={3} required />
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <button type="submit" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)]">Save area</button>
          </div>
        </form>

        <form action={updateReviewAction} className="flex flex-wrap gap-3 text-sm items-center">
          <label className="flex items-center gap-2">Score
            <select name="score" defaultValue={area.lastHealthScore ?? ""} className="border border-[var(--border-default)] bg-[var(--card)] px-2 py-1">
              <option value="">Set</option>
              {[1,2,3,4,5].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2">Date
            <input name="date" type="date" defaultValue={area.lastReviewDate ? area.lastReviewDate.toISOString().slice(0,10) : ""} className="border border-[var(--border-default)] bg-[var(--card)] px-2 py-1" />
          </label>
          <button type="submit" className="rounded-md border border-[var(--border-default)] px-3 py-2 text-sm font-semibold">Update review</button>
        </form>
      </div>

      <div className="panel space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Items in this area</h2>
          <span className="text-xs text-[var(--text-secondary)]">{area.items.length} items</span>
        </div>
        <div className="space-y-3">
          {area.items.map((item) => (
            <div key={item.id} className="rounded border border-[var(--border-subtle)] bg-[var(--card)] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-[var(--text-primary)]">{item.title}</div>
                <span className="text-xs text-[var(--text-secondary)]">{item.type}</span>
              </div>
              {item.details && <div className="text-sm text-[var(--text-secondary)]">{item.details}</div>}
              {item.url && <a href={item.url} className="text-xs font-medium text-[var(--text-primary)] underline" target="_blank" rel="noreferrer">{item.url}</a>}
              <form action={updateItemAction} className="grid gap-2 md:grid-cols-2">
                <input type="hidden" name="itemId" value={item.id} />
                <input name="title" defaultValue={item.title} className="border border-[var(--border-default)] bg-[var(--card)] px-2 py-1" required />
                <select name="type" defaultValue={item.type} className="border border-[var(--border-default)] bg-[var(--card)] px-2 py-1">
                  {Object.values(ItemType).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <textarea name="details" defaultValue={item.details ?? ""} rows={2} className="border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 md:col-span-2" />
                <input name="url" defaultValue={item.url ?? ""} placeholder="URL" className="border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 md:col-span-2" />
                <button type="submit" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-sm font-semibold text-[var(--text-inverse)] md:col-span-2">Save item</button>
              </form>
              <form action={moveItemAction} className="flex flex-wrap gap-2 text-sm">
                <input type="hidden" name="itemId" value={item.id} />
                <select name="target" className="border border-[var(--border-default)] bg-[var(--card)] px-2 py-1" required>
                  <option value="">Move to...</option>
                  <option value="inbox">Inbox</option>
                  <option value="project">Project</option>
                  <option value="resource">Resource</option>
                  <option value="archive">Archive</option>
                </select>
                <select name="projectId" className="border border-[var(--border-default)] bg-[var(--card)] px-2 py-1">
                  <option value="">Project target</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select name="collectionId" className="border border-[var(--border-default)] bg-[var(--card)] px-2 py-1">
                  <option value="">Resource target</option>
                  {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="submit" className="rounded-md border border-[var(--border-default)] px-3 py-2 text-sm font-semibold">Apply</button>
              </form>
            </div>
          ))}
          {area.items.length === 0 && <div className="text-sm text-[var(--text-secondary)]">No items in this area.</div>}
        </div>
      </div>

      <div className="panel space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Add next action</h2>
        <form action={addItemAction} className="grid gap-3 md:grid-cols-2">
          <input name="title" placeholder="Title" className="border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 md:col-span-2" required />
          <textarea name="details" placeholder="Details" className="border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 md:col-span-2" rows={3} />
          <input name="url" placeholder="URL (optional)" className="border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 md:col-span-2" />
          <select name="type" className="border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 md:col-span-2" defaultValue={ItemType.NOTE}>
            {Object.values(ItemType).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button type="submit" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] md:col-span-2">Add item</button>
        </form>
      </div>

      <div className="text-sm text-[var(--text-secondary)]"><Link href="/areas" className="underline">Back to areas</Link></div>
    </div>
  );
}
