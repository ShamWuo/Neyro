import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ResourceSearch } from "@/components/resource-search";

export default async function ResourcesPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;
  const { q = "" } = (await searchParams) ?? {};

  const collections = await prisma.resourceCollection.findMany({
    where: {
      userId,
      archivedAt: null,
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    where: { userId, archivedAt: null },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  async function createCollection(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim() || null;
    if (!name) return;
    await prisma.resourceCollection.create({ data: { userId, name, description } });
  }

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Resources</h1>
        <p className="text-sm text-[var(--text-secondary)]">Reference collections, not tasks.</p>
      </div>

      <ResourceSearch />

      <form action={createCollection} className="panel space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <input name="name" placeholder="Collection name" className="w-full border border-[var(--border-default)] bg-[var(--card)] px-3 py-2" required />
          <textarea name="description" placeholder="Description (optional)" className="w-full border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 md:col-span-2" rows={2} />
        </div>
        <button type="submit" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)]">Create collection</button>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Collections ({collections.length})</h2>
          <div className="text-xs text-[var(--text-secondary)]">
            Total items: {collections.reduce((sum, c) => sum + c._count.items, 0)}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Link key={c.id} href={`/resources/${c.id}`} className="panel space-y-2 transition hover:-translate-y-[1px] hover:shadow-md">
              <div className="font-semibold text-[var(--text-primary)]">{c.name}</div>
              {c.description && <div className="text-sm text-[var(--text-secondary)] line-clamp-2">{c.description}</div>}
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>{c._count.items} items</span>
                <span className="text-[var(--text-tertiary)]">View →</span>
              </div>
            </Link>
          ))}
          {collections.length === 0 && (
            <div className="col-span-full text-center py-8 text-sm text-[var(--text-secondary)]">
              No resource collections yet. Create one above to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
