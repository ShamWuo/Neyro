import { auth } from "@/auth";
import { getActiveProjectCount } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProgressIndicator } from "@/components/progress-indicator";
import { classifyInboxItem, applyProjectDecisions, toSummary, finishReview } from "./actions";

export default async function ReviewPage({ searchParams }: { searchParams?: Promise<{ step?: string; scores?: string; avg?: string }> }) {
  const { step = "1", scores = "", avg } = (await searchParams) ?? {};
  const scoresParam = scores;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const [inboxItems, activeProjects, areas, collections, inboxCount, activeCount] = await Promise.all([
    prisma.item.findMany({ where: { userId, classification: ItemClassification.INBOX, archivedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.project.findMany({ where: { userId, archivedAt: null, status: ProjectStatus.ACTIVE }, orderBy: { createdAt: "desc" } }),
    prisma.area.findMany({ where: { userId, archivedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.resourceCollection.findMany({ where: { userId, archivedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.item.count({ where: { userId, classification: ItemClassification.INBOX, archivedAt: null } }),
    getActiveProjectCount(userId),
  ]);

  const decodedScores = scoresParam ? decodeURIComponent(scoresParam).split(",").filter(Boolean) : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Weekly Review</h1>
          <p className="text-sm text-[var(--text-secondary)]">Guided multi-step sweep.</p>
        </div>
        <div className="text-xs text-[var(--text-secondary)]">Step {step} of 4</div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--primary-strong)_8%,var(--bg))] px-4 py-3 text-sm text-[var(--text-primary)] md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Upgrade to Focus</div>
          <div className="font-semibold">Export this review, keep timelines, and unlock team accountability.</div>
          <p className="text-xs text-[var(--text-secondary)]">Stay under the project cap, ship reviews weekly, and share recaps.</p>
        </div>
        <div className="flex gap-2 text-sm font-semibold">
          <Link href="/pricing" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-[var(--text-inverse)] shadow-sm transition hover:shadow-[var(--elev-2)]">Upgrade</Link>
          <Link href="/weekly-review" className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Open wizard</Link>
        </div>
      </div>

      <ProgressIndicator
        currentStep={parseInt(step)}
        totalSteps={4}
        labels={["Inbox", "Projects", "Areas", "Summary"]}
        className="mb-6"
      />

      {step === "1" && (
        <section className="panel space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Step 1 – Inbox cleanup</h2>
              <p className="text-xs text-[var(--text-secondary)]">Inbox items: {inboxItems.length}. You have {inboxItems.length} items remaining.</p>
            </div>
            <Link href="/inbox" className="text-xs font-semibold text-[var(--primary-strong)] hover:text-[var(--primary)]">Open full inbox</Link>
          </div>
          <div className="space-y-3">
            {inboxItems.map((item) => (
              <div key={item.id} className="rounded border border-[var(--border-subtle)] bg-[var(--card-muted)] p-3 space-y-2">
                <div className="font-semibold text-[var(--text-primary)]">{item.title}</div>
                {item.details && <div className="text-sm text-[var(--text-secondary)]">{item.details}</div>}
                {item.url && <a href={item.url} className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]" target="_blank" rel="noreferrer">{item.url}</a>}
                <form action={classifyInboxItem} className="flex flex-wrap gap-2 text-sm">
                  <input type="hidden" name="itemId" value={item.id} />
                  <select name="target" className="border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 text-[var(--text-primary)]" required>
                    <option value="">Move to...</option>
                    <option value="project">Project</option>
                    <option value="area">Area</option>
                    <option value="resource">Resource</option>
                    <option value="archive">Archive</option>
                    <option value="inbox">Inbox</option>
                    <option value="ai">Let AI decide</option>
                  </select>
                  <select name="projectId" className="border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 text-[var(--text-primary)]">
                    <option value="">Project</option>
                    {activeProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select name="areaId" className="border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 text-[var(--text-primary)]">
                    <option value="">Area</option>
                    {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <select name="collectionId" className="border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 text-[var(--text-primary)]">
                    <option value="">Resource</option>
                    {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Apply</button>
                </form>
              </div>
            ))}
            {inboxItems.length === 0 && <div className="text-sm text-[var(--text-secondary)]">Inbox clear. Great work.</div>}
          </div>
          <div className="flex justify-end">
            <Link href="/review?step=2" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)]">Next step</Link>
          </div>
        </section>
      )}

      {step === "2" && (
        <section className="panel space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Step 2 – Projects review</h2>
            <span className="text-xs text-[var(--text-secondary)]">Active: {activeProjects.length} / 7</span>
          </div>
          <form action={applyProjectDecisions} className="space-y-2">
            {activeProjects.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--card-muted)] p-3 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-[var(--text-primary)]">{p.name}</div>
                  <div className="text-xs text-[var(--text-secondary)]">Outcome: {p.outcome}</div>
                </div>
                <div className="flex gap-2">
                  {[ProjectStatus.ACTIVE, ProjectStatus.PAUSED, ProjectStatus.COMPLETED].map((status) => (
                    <label key={status} className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                      <input type="radio" name={`decision-${p.id}`} value={status} defaultChecked={status === ProjectStatus.ACTIVE} /> {status}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {activeProjects.length === 0 && <div className="text-sm text-[var(--text-secondary)]">No active projects.</div>}
            <div className="flex justify-end gap-2">
              <Link href="/review?step=1" className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Back</Link>
              <button type="submit" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)]">Apply decisions</button>
            </div>
          </form>
        </section>
      )}

      {step === "3" && (
        <section className="panel space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Step 3 – Areas check-in</h2>
            <span className="text-xs text-[var(--text-secondary)]">Score every area</span>
          </div>
          <form action={toSummary} className="space-y-3">
            {areas.map((a) => (
              <div key={a.id} className="space-y-2 rounded border border-[var(--border-subtle)] bg-[var(--card-muted)] p-3">
                <div className="font-semibold text-[var(--text-primary)]">{a.name}</div>
                <div className="text-xs text-[var(--text-secondary)]">{a.standard}</div>
                <select name={`area-${a.id}`} className="border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 text-sm text-[var(--text-primary)]" required>
                  <option value="">Score 1-5</option>
                  {[1,2,3,4,5].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input name={`next-${a.id}`} placeholder="Add next action (optional)" className="w-full border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]" />
                <input name={`details-${a.id}`} placeholder="Notes" className="w-full border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]" />
                <input name={`url-${a.id}`} placeholder="URL (optional)" className="w-full border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]" />
              </div>
            ))}
            {areas.length === 0 && <div className="text-sm text-[var(--text-secondary)]">No areas defined.</div>}
            <div className="flex justify-end gap-2">
              <Link href="/review?step=2" className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Back</Link>
              <button type="submit" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)]">Next / Summary</button>
            </div>
          </form>
        </section>
      )}

      {step === "4" && (
        <section className="panel space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Step 4 – Summary & save</h2>
          <div className="space-y-1 text-sm text-[var(--text-primary)]">
            <div>Inbox now: {inboxCount}</div>
            <div>Active projects now: {activeCount}</div>
            <div>Average area score: {avg ?? "n/a"}</div>
          </div>
          <div className="space-y-1 text-xs text-[var(--text-secondary)]">
            {decodedScores.map((pair) => {
              const [areaId, score] = pair.split(":");
              const area = areas.find((a) => a.id === areaId);
              return <div key={pair}>{area?.name ?? areaId}: {score}</div>;
            })}
          </div>
          <form action={finishReview} className="space-y-2">
            <input type="hidden" name="scores" value={scoresParam} />
            <div className="flex gap-2">
              <Link href="/review?step=3" className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Back</Link>
              <button type="submit" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)]">Finish review</button>
              <Link href="/pricing" className="rounded-md border border-[var(--primary-strong)] bg-[color-mix(in_srgb,var(--primary-strong)_10%,var(--surface))] px-4 py-2 text-sm font-semibold text-[var(--primary-strong)] hover:bg-[color-mix(in_srgb,var(--primary-strong)_16%,var(--surface))] transition">
                Export (Focus)
              </Link>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
