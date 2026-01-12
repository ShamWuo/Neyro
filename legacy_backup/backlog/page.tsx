import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { convertAction } from "./actions";

export default async function BacklogPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const collections = await prisma.resourceCollection.findMany({ where: { userId, archivedAt: null }, include: { _count: { select: { items: true } } } });

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Backlog</h1>
        <p className="text-sm text-[var(--text-secondary)]">Promote rich resource collections into real projects.</p>
      </div>
      <div className="space-y-3">
        {collections.map((c) => (
          <div key={c.id} className="panel flex items-center justify-between text-sm">
            <div className="space-y-1">
              <div className="font-semibold text-[var(--text-primary)]">{c.name}</div>
              <div className="text-xs text-[var(--text-secondary)]">{c._count.items} items</div>
            </div>
            {c._count.items >= 5 && (
              <form action={convertAction}>
                <input type="hidden" name="collectionId" value={c.id} />
                <button className="rounded-md border border-[var(--text-primary)] bg-[var(--text-primary)] px-3 py-1 text-xs font-semibold text-[var(--text-inverse)]">Convert to project</button>
              </form>
            )}
          </div>
        ))}
        {collections.length === 0 && <div className="text-sm text-[var(--text-secondary)]">No collections yet.</div>}
      </div>
    </div>
  );
}
