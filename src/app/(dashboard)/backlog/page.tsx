import { auth } from "@/auth";
import { ensureProjectLimit, touchCollection } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function BacklogPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const collections = await prisma.resourceCollection.findMany({ where: { userId, archivedAt: null }, include: { _count: { select: { items: true } } } });

  async function convert(collectionId: string) {
    "use server";
    if (!collectionId) return;
    await ensureProjectLimit(userId);
    const collection = await prisma.resourceCollection.findUnique({ where: { id: collectionId, userId }, include: { items: true } });
    if (!collection) return;
    const project = await prisma.project.create({ data: { userId, name: collection.name, outcome: collection.description ?? "Outcome", status: ProjectStatus.ACTIVE } });
    if (collection.items.length) {
      await prisma.item.updateMany({ where: { id: { in: collection.items.map((i) => i.id) }, userId }, data: { classification: ItemClassification.PROJECT, projectId: project.id, resourceCollectionId: null } });
    }
    await touchCollection(userId, collectionId);
    redirect(`/projects/${project.id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Backlog</h1>
        <p className="text-sm text-zinc-600">Promote rich resources into real projects.</p>
      </div>
      <div className="space-y-3">
        {collections.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded border border-zinc-200 bg-white p-4 shadow-sm text-sm">
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs text-zinc-500">{c._count.items} items</div>
            </div>
            {c._count.items >= 5 && (
              <form action={() => convert(c.id)}>
                <button className="rounded border px-3 py-1 text-xs">Convert to project</button>
              </form>
            )}
          </div>
        ))}
        {collections.length === 0 && <div className="text-sm text-zinc-500">No collections yet.</div>}
      </div>
    </div>
  );
}
