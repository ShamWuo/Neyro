import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AreasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const areas = await prisma.area.findMany({ where: { userId, archivedAt: null }, orderBy: { createdAt: "desc" } });

  async function createArea(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const standard = String(formData.get("standard") ?? "").trim();
    if (!name || !standard) return;
    await prisma.area.create({ data: { userId, name, standard } });
  }

  async function updateHealth(areaId: string, score: number) {
    "use server";
    await prisma.area.update({ where: { id: areaId, userId }, data: { lastHealthScore: score, lastReviewDate: new Date() } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Areas</h1>
        <p className="text-sm text-zinc-600">Ongoing responsibilities and standards.</p>
      </div>

      <form action={createArea} className="space-y-3 rounded border border-zinc-200 bg-white p-4 shadow-sm">
        <input name="name" placeholder="Name" className="w-full rounded border border-zinc-300 px-3 py-2" required />
        <textarea name="standard" placeholder="Standard to maintain" className="w-full rounded border border-zinc-300 px-3 py-2" rows={2} required />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">Add area</button>
      </form>

      <div className="space-y-3">
        {areas.map((a) => (
          <div key={a.id} className="rounded border border-zinc-200 bg-white p-3 shadow-sm">
            <div className="font-semibold">{a.name}</div>
            <div className="text-sm text-zinc-600">{a.standard}</div>
            <div className="text-xs text-zinc-500">Last health: {a.lastHealthScore ?? "n/a"}</div>
            <div className="mt-2 flex gap-2 text-sm">
              {[1, 2, 3, 4, 5].map((score) => (
                <form key={score} action={() => updateHealth(a.id, score)}>
                  <button className="rounded border px-2 py-1">Set {score}</button>
                </form>
              ))}
            </div>
          </div>
        ))}
        {areas.length === 0 && <div className="text-sm text-zinc-600">No areas yet.</div>}
      </div>
    </div>
  );
}
