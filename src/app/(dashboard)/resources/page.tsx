import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function ResourcesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const collections = await prisma.resourceCollection.findMany({
    where: { userId, archivedAt: null },
    include: { items: { where: { classification: ItemClassification.RESOURCE }, orderBy: { createdAt: "desc" } } },
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Resources</h1>
        <p className="text-sm text-zinc-600">Reference collections, not tasks.</p>
      </div>

      <form action={createCollection} className="space-y-3 rounded border border-zinc-200 bg-white p-4 shadow-sm">
        <input name="name" placeholder="Collection name" className="w-full rounded border border-zinc-300 px-3 py-2" required />
        <textarea name="description" placeholder="Description (optional)" className="w-full rounded border border-zinc-300 px-3 py-2" rows={2} />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">Create collection</button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <div key={c.id} className="rounded border border-zinc-200 bg-white p-3 shadow-sm space-y-2">
            <div className="font-semibold">{c.name}</div>
            {c.description && <div className="text-sm text-zinc-600">{c.description}</div>}
            <div className="text-xs text-zinc-500">{c.items.length} items</div>
            <div className="space-y-1">
              {c.items.map((item) => (
                <div key={item.id} className="rounded border border-zinc-200 px-2 py-1 text-sm">
                  <div className="font-medium">{item.title}</div>
                  {item.url && (
                    <a className="text-xs text-blue-600 underline" href={item.url} target="_blank" rel="noreferrer">
                      {item.url}
                    </a>
                  )}
                  {item.details && <div className="text-xs text-zinc-600">{item.details}</div>}
                </div>
              ))}
              {c.items.length === 0 && <div className="text-xs text-zinc-500">Empty collection.</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
