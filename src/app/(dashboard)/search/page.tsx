import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ItemType, Prisma } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchFilters } from "@/components/search-filters";
import { Badge } from "@/components/ui/badge";
import { SavedSearches } from "@/components/saved-searches";

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; classification?: string; type?: string; sort?: string }> }) {
  const params = await searchParams;
  const q = params?.q || "";
  const classification = params?.classification as ItemClassification | undefined;
  const type = params?.type as ItemType | undefined;
  const sort = params?.sort || "updated";

  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const savedSearches = await prisma.savedSearch.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  const where: Prisma.ItemWhereInput = {
    userId,
    archivedAt: null,
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { details: { contains: q, mode: "insensitive" } },
    ];
  }

  if (classification) {
    where.classification = classification;
  }

  if (type) {
    where.type = type;
  }

  let orderBy: Prisma.ItemOrderByWithRelationInput | Prisma.ItemOrderByWithRelationInput[];
  if (sort === "created") {
    orderBy = { createdAt: "desc" };
  } else if (sort === "title") {
    orderBy = { title: "asc" };
  } else if (sort === "due") {
    orderBy = [
      { dueDate: "asc" },
      { createdAt: "desc" },
    ];
  } else {
    orderBy = { updatedAt: "desc" };
  }

  const items = await prisma.item.findMany({
    where,
    orderBy,
    take: 50,
    include: {
      project: { select: { id: true, name: true } },
      area: { select: { id: true, name: true } },
      resourceCollection: { select: { id: true, name: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Search & Filter</h1>
          <p className="text-sm text-[var(--text-secondary)]">Search across all items or use filters to narrow down results.</p>
        </div>
        <form className="flex gap-2" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search items..."
            className="flex-1 border border-[var(--border-default)] bg-[var(--card)] px-3 py-2"
            autoFocus
          />
          {classification && <input type="hidden" name="classification" value={classification} />}
          {type && <input type="hidden" name="type" value={type} />}
          {sort && <input type="hidden" name="sort" value={sort} />}
          <button className="rounded-md border border-[var(--text-primary)] bg-[var(--text-primary)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)]">
            Search
          </button>
        </form>
        <SearchFilters />
      </div>

      <div className="panel space-y-4">
        <SavedSearches initialSearches={savedSearches.map((s) => ({
          id: s.id,
          name: s.name,
          query: s.query,
          filters: s.filters as Record<string, unknown>,
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        }))} />
      </div>

      <div className="panel space-y-2">
        {items.length > 0 && (
            <div className="text-xs text-[var(--text-secondary)] mb-4">
            Found {items.length} {items.length === 1 ? "item" : "items"}
          </div>
        )}
        {items.map((item) => {
          const formatDate = (date: Date | null) =>
            date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;
          const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && !item.isDone;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm rounded border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-3 hover:border-[var(--border-default)] transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold text-[var(--text-primary)]">{item.title}</div>
                  <Badge variant="default" className="text-xs">
                    {item.classification}
                  </Badge>
                  {item.type && (
                    <Badge variant="info" className="text-xs">
                      {item.type}
                    </Badge>
                  )}
                  {item.dueDate && (
                    <Badge variant={isOverdue ? "error" : "info"} className="text-xs">
                      Due: {formatDate(item.dueDate)}
                    </Badge>
                  )}
                  {item.isDone && (
                    <Badge variant="success" className="text-xs">
                      Done
                    </Badge>
                  )}
                </div>
                {item.details && (
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{item.details}</p>
                )}
                <div className="text-xs text-[var(--text-secondary)]">
                  {item.project && `Project: ${item.project.name} · `}
                  {item.area && `Area: ${item.area.name} · `}
                  {item.resourceCollection && `Resource: ${item.resourceCollection.name} · `}
                  Updated {formatDate(new Date(item.updatedAt || item.createdAt))}
                </div>
              </div>
              <div className="ml-4 flex gap-2">
                {item.classification === ItemClassification.PROJECT && item.projectId && (
                  <Link
                    href={`/projects/${item.projectId}`}
                    className="text-xs font-semibold text-[var(--text-primary)] hover:underline"
                  >
                    Open
                  </Link>
                )}
                {item.classification === ItemClassification.AREA && item.areaId && (
                  <Link
                    href={`/areas/${item.areaId}`}
                    className="text-xs font-semibold text-[var(--text-primary)] hover:underline"
                  >
                    Open
                  </Link>
                )}
                {item.classification === ItemClassification.RESOURCE && item.resourceCollectionId && (
                  <Link
                    href={`/resources/${item.resourceCollectionId}`}
                    className="text-xs font-semibold text-[var(--text-primary)] hover:underline"
                  >
                    Open
                  </Link>
                )}
                {item.classification === ItemClassification.INBOX && (
                  <Link href={`/inbox`} className="text-xs font-semibold text-[var(--text-primary)] hover:underline">
                    Inbox
                  </Link>
                )}
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <EmptyState
            title={q || classification || type ? "No results found" : "Start searching"}
            description={
              q || classification || type
                ? `No items found matching your search criteria. Try adjusting your filters or search terms.`
                : "Search across all your items, projects, areas, and resources. Use the search box above to get started."
            }
            icon={q || classification || type ? "🔍" : "🔎"}
          />
        )}
      </div>
    </div>
  );
}
