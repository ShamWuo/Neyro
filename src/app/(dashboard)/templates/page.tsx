import { auth } from "@/auth";
import { ensureProjectLimit } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { TemplateType, ProjectStatus, ItemClassification, ItemType } from "@prisma/client";
import { redirect } from "next/navigation";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Templates</h1>
        <p className="text-sm text-zinc-600">Create and apply your rituals quickly.</p>
      </div>

      <form action={createTemplate} className="space-y-3 rounded border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <input name="name" placeholder="Template name" className="rounded border border-zinc-300 px-3 py-2" required />
          <select name="type" className="rounded border border-zinc-300 px-3 py-2">
            {Object.values(TemplateType).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <input name="description" placeholder="Description" className="rounded border border-zinc-300 px-3 py-2" />
        <textarea name="data" placeholder='Optional JSON e.g. {"outcome":"Ship feature"}' className="w-full rounded border border-zinc-300 px-3 py-2" rows={4} />
        <button className="rounded bg-black px-4 py-2 text-white">Save template</button>
      </form>

      <div className="space-y-3">
        {templates.map((t) => (
          <div key={t.id} className="rounded border border-zinc-200 bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs text-zinc-500">{t.type}</div>
                {t.description && <div className="text-sm text-zinc-600">{t.description}</div>}
              </div>
              <form action={applyTemplate}>
                <input type="hidden" name="templateId" value={t.id} />
                <button className="rounded border px-3 py-1 text-sm">Apply</button>
              </form>
            </div>
          </div>
        ))}
        {templates.length === 0 && <div className="text-sm text-zinc-500">No templates yet.</div>}
      </div>
    </div>
  );
}
