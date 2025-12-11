import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const { q = "" } = (await searchParams) ?? {};
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const items = await prisma.item.findMany({
    where: {
      userId,
      title: q ? { contains: q, mode: "insensitive" } : undefined,
      archivedAt: null,
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Quick find</h1>
      <form className="flex gap-2" method="get">
        <input name="q" defaultValue={q} placeholder="Search" className="flex-1 rounded border border-zinc-300 px-3 py-2" autoFocus />
        <button className="rounded bg-black px-4 py-2 text-white">Find</button>
      </form>
      <div className="space-y-2 rounded border border-zinc-200 bg-white p-4 shadow-sm">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <div>
              <div className="font-semibold">{item.title}</div>
              <div className="text-xs text-zinc-500">{item.classification}</div>
            </div>
            {item.classification === ItemClassification.PROJECT && item.projectId && <Link href={`/projects/${item.projectId}`} className="text-xs text-blue-600 underline">Open</Link>}
            {item.classification === ItemClassification.AREA && item.areaId && <Link href={`/areas/${item.areaId}`} className="text-xs text-blue-600 underline">Open</Link>}
            {item.classification === ItemClassification.RESOURCE && item.resourceCollectionId && <Link href={`/resources/${item.resourceCollectionId}`} className="text-xs text-blue-600 underline">Open</Link>}
            {item.classification === ItemClassification.INBOX && <Link href={`/inbox`} className="text-xs text-blue-600 underline">Inbox</Link>}
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-zinc-500">No results.</div>}
      </div>
    </div>
  );
}
