import { auth } from "@/auth";
import { ensureProjectLimit } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { TemplateType, ProjectStatus, ItemClassification, ItemType } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";

type TemplateData = {
  name?: string;
  outcome?: string;
  standard?: string;
  area?: string;
  items?: string[];
};

const toTemplateData = (value: unknown): TemplateData => {
  if (!value || typeof value !== "object" || value === null) return {};
  const record = value as Record<string, unknown>;
  const itemsValue = record.items;
  const items = Array.isArray(itemsValue) ? itemsValue.filter((entry): entry is string => typeof entry === "string") : undefined;

  return {
    name: typeof record.name === "string" ? record.name : undefined,
    outcome: typeof record.outcome === "string" ? record.outcome : undefined,
    standard: typeof record.standard === "string" ? record.standard : undefined,
    area: typeof record.area === "string" ? record.area : undefined,
    items,
  };
};

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const templates = await prisma.template.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });

  async function createTemplate(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const type = String(formData.get("type") ?? TemplateType.PROJECT) as TemplateType;
    const description = String(formData.get("description") ?? "").trim() || null;
    const dataRaw = String(formData.get("data") ?? "").trim();
    if (!name) return;
    let data: TemplateData = {};
    try {
      data = dataRaw ? toTemplateData(JSON.parse(dataRaw)) : {};
    } catch {
      data = {};
    }
    await prisma.template.create({ data: { userId, name, type, description, data } });
    redirect("/templates");
  }

  async function applyTemplate(formData: FormData) {
    "use server";
    const templateId = String(formData.get("templateId") ?? "");
    if (!templateId) return;
    const template = await prisma.template.findUnique({ where: { id: templateId, userId } });
    if (!template) return;
    const templateData = toTemplateData(template.data);
    if (template.type === TemplateType.PROJECT) {
      await ensureProjectLimit(userId);
      const name = templateData.name ?? template.name;
      const outcome = templateData.outcome ?? template.description ?? "Outcome";
      await prisma.project.create({ data: { userId, name, outcome, status: ProjectStatus.ACTIVE } });
      redirect("/projects");
      return;
    }
    if (template.type === TemplateType.AREA) {
      const name = templateData.name ?? template.name;
      const standard = templateData.standard ?? template.description ?? "Standard";
      await prisma.area.create({ data: { userId, name, standard } });
      redirect("/areas");
      return;
    }
    if (template.type === TemplateType.CHECKLIST) {
      const areaName = templateData.area ?? "Checklist";
      const area = await prisma.area.create({ data: { userId, name: areaName, standard: "Checklist" } });
      const items = templateData.items ?? [];
      if (items.length) {
        await prisma.item.createMany({
          data: items.map((title: string) => ({ userId, title, classification: ItemClassification.AREA, areaId: area.id, type: ItemType.TASK })),
        });
      }
      redirect(`/areas/${area.id}`);
      return;
    }
    redirect("/templates");
  }

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-sm text-[var(--text-secondary)]">Create and apply your rituals quickly.</p>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--primary-strong)_6%,var(--card))] px-3 py-2 text-sm text-[var(--text-primary)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Upgrade</div>
              <div className="font-semibold">Access premium template packs and sharing with Focus.</div>
            </div>
            <div className="flex gap-2 text-sm font-semibold">
              <Link href="/pricing" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-white shadow-sm transition hover:shadow-[var(--elev-2)]">See plans</Link>
              <Link href="/assist" className="rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-[var(--text-primary)]">Generate with AI</Link>
            </div>
          </div>
        </div>
      </div>

      <form action={createTemplate} className="panel space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <input name="name" placeholder="Template name" className="border border-[var(--border-default)] bg-white px-3 py-2" required />
          <select name="type" className="border border-[var(--border-default)] bg-white px-3 py-2">
            {Object.values(TemplateType).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <input name="description" placeholder="Description" className="border border-[var(--border-default)] bg-white px-3 py-2" />
        <textarea name="data" placeholder='Optional JSON e.g. {"outcome":"Ship feature"}' className="w-full border border-[var(--border-default)] bg-white px-3 py-2" rows={4} />
        <button className="rounded-md border border-[var(--text-primary)] bg-[var(--text-primary)] px-4 py-2 text-sm font-semibold text-white">Save template</button>
      </form>

      <div className="space-y-3">
        {templates.map((t) => (
          <div key={t.id} className="panel space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-semibold text-[var(--text-primary)]">{t.name}</div>
                <div className="text-xs text-[var(--text-secondary)]">{t.type}</div>
                {t.description && <div className="text-sm text-[var(--text-secondary)]">{t.description}</div>}
              </div>
              <form action={applyTemplate}>
                <input type="hidden" name="templateId" value={t.id} />
                <button className="rounded-md border border-[var(--border-default)] px-3 py-1 text-sm font-semibold">Apply</button>
              </form>
            </div>
          </div>
        ))}
        {templates.length === 0 && <div className="text-sm text-[var(--text-secondary)]">No templates yet.</div>}
      </div>
    </div>
  );
}
