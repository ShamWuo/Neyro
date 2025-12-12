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
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Quick find + AI classify</h1>
        <p className="text-sm text-[#555]">Search across active items or drop text/photo to auto-classify.</p>
        <form className="flex gap-2" method="get">
          <input name="q" defaultValue={q} placeholder="Search" className="flex-1 border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2" autoFocus />
          <button className="rounded-md border border-[#0b0d0f] bg-[#0b0d0f] px-4 py-2 text-sm font-semibold text-white">Find</button>
        </form>
        <form action="/api/assist/ingest" method="post" encType="multipart/form-data" className="grid gap-2 rounded-md border border-[rgba(0,0,0,0.06)] bg-[#f8f9fa] p-3 text-sm">
          <input name="text" placeholder="Paste text for AI classification" className="border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2" />
          <input name="image" type="file" accept="image/*" className="text-xs" />
          <button className="rounded-md border border-[#0b0d0f] bg-[#0b0d0f] px-3 py-2 text-sm font-semibold text-white">Send to AI</button>
        </form>
      </div>
      <div className="panel space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm rounded border border-[rgba(0,0,0,0.06)] bg-[#f8f9fa] px-4 py-3">
            <div>
              <div className="font-semibold text-[#0b0d0f]">{item.title}</div>
              <div className="text-xs text-[#555]">{item.classification}</div>
            </div>
            {item.classification === ItemClassification.PROJECT && item.projectId && <Link href={`/projects/${item.projectId}`} className="text-xs font-semibold text-[#0f172a]">Open</Link>}
            {item.classification === ItemClassification.AREA && item.areaId && <Link href={`/areas/${item.areaId}`} className="text-xs font-semibold text-[#0f172a]">Open</Link>}
            {item.classification === ItemClassification.RESOURCE && item.resourceCollectionId && <Link href={`/resources/${item.resourceCollectionId}`} className="text-xs font-semibold text-[#0f172a]">Open</Link>}
            {item.classification === ItemClassification.INBOX && <Link href={`/inbox`} className="text-xs font-semibold text-[#0f172a]">Inbox</Link>}
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-[#555]">No results.</div>}
      </div>
    </div>
  );
}
