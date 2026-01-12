import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TemplateType } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createTemplate, applyTemplate } from "./actions";
import { canAccessFeature } from "@/lib/subscription";
import { UpgradePromptMobile } from "@/components/upgrade-prompt-mobile";

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const hasTemplateAccess = await canAccessFeature(userId, "templates");
  const templates = await prisma.template.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-sm text-[var(--text-secondary)]">Create and apply your rituals quickly.</p>
      </div>

      {!hasTemplateAccess && (
        <UpgradePromptMobile
          trigger="template"
        />
      )}

      {!hasTemplateAccess && (
        <div className="rounded-lg border-2 border-[var(--border-subtle)] bg-[var(--card)] p-6 text-center space-y-4">
          <p className="text-base text-[var(--text-secondary)]">
            Templates are a Focus feature. Upgrade to access project and area templates to get started faster.
          </p>
          <Link
            href="/settings/billing"
            className="inline-block rounded-lg border-2 border-[var(--primary-strong)] bg-[var(--primary-strong)] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all active:scale-95 active:shadow-none touch-manipulation"
          >
            Upgrade to Focus
          </Link>
        </div>
      )}

      {hasTemplateAccess && (
        <>
          <form action={createTemplate} className="panel space-y-4 p-4 md:p-6">
            <div className="grid gap-3 md:grid-cols-2">
              <input name="name" placeholder="Template name" className="border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 rounded-lg" required />
              <select name="type" className="border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 rounded-lg">
                {Object.values(TemplateType).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <input name="description" placeholder="Description" className="border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 rounded-lg w-full" />
            <textarea name="data" placeholder='Optional JSON e.g. {"outcome":"Ship feature"}' className="w-full border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 rounded-lg" rows={4} />
            <button className="rounded-lg border-2 border-[var(--primary-strong)] bg-[var(--primary-strong)] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all active:scale-95 active:shadow-none touch-manipulation">Save template</button>
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
                    <button className="rounded-lg border border-[var(--border-default)] px-4 py-2 text-sm font-semibold transition-all active:scale-95 touch-manipulation">Apply</button>
                  </form>
                </div>
              </div>
            ))}
            {templates.length === 0 && <div className="text-sm text-[var(--text-secondary)]">No templates yet.</div>}
          </div>
        </>
      )}
    </div>
  );
}
