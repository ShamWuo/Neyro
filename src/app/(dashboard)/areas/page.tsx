import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AreaTemplateForm } from "@/components/area-template-form";

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

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Areas</h1>
        <p className="text-sm text-[var(--text-secondary)]">Guard standards for ongoing responsibilities.</p>
      </div>

      <AreaTemplateForm createAreaAction={createArea} />

      <div className="grid gap-4 md:grid-cols-2">
        {areas.map((a) => (
          <Link key={a.id} href={`/areas/${a.id}`} className="panel space-y-2 transition hover:-translate-y-[1px] hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[var(--text-primary)]">{a.name}</div>
              <span className="badge">{a.lastHealthScore ?? "n/a"}</span>
            </div>
            <div className="text-sm text-[var(--text-secondary)] line-clamp-2">{a.standard}</div>
            <div className="text-xs text-[var(--text-secondary)]">Last reviewed: {a.lastReviewDate ? a.lastReviewDate.toISOString().slice(0, 10) : "n/a"}</div>
          </Link>
        ))}
        {areas.length === 0 && <div className="text-sm text-[var(--text-secondary)]">No areas yet.</div>}
      </div>
    </div>
  );
}
