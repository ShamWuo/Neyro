import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ResourcesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const collections = await prisma.resourceCollection.findMany({
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
        <p className="text-sm text-[#555]">Reference collections, not tasks.</p>
      </div>

      <form action={createCollection} className="panel space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <input name="name" placeholder="Collection name" className="w-full border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2" required />
          <textarea name="description" placeholder="Description (optional)" className="w-full border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 md:col-span-2" rows={2} />
        </div>
        <button type="submit" className="rounded-md border border-[#0b0d0f] bg-[#0b0d0f] px-4 py-2 text-sm font-semibold text-white">Create collection</button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <Link key={c.id} href={`/resources/${c.id}`} className="panel space-y-2 transition hover:-translate-y-[1px] hover:shadow-md">
            <div className="font-semibold text-[#0b0d0f]">{c.name}</div>
            {c.description && <div className="text-sm text-[#555] line-clamp-2">{c.description}</div>}
            <div className="text-xs text-[#555]">{c._count.items} items</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
