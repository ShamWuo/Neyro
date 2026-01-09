import { auth } from "@/auth";
import { getActiveProjectCount } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ItemType, ProjectStatus } from "@prisma/client";
import { analyzeParaCapture } from "@/lib/ai";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProgressIndicator } from "@/components/progress-indicator";
import { logger } from "@/lib/logger";

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

  async function classifyInboxItem(formData: FormData) {
    "use server";
    const itemId = String(formData.get("itemId") ?? "");
    const target = String(formData.get("target") ?? "");
    const projectId = String(formData.get("projectId") ?? "").trim() || null;
    const areaId = String(formData.get("areaId") ?? "").trim() || null;
    const collectionId = String(formData.get("collectionId") ?? "").trim() || null;
    if (!itemId) return;

    if (target === "project" && projectId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.PROJECT, projectId, areaId: null, resourceCollectionId: null, archivedAt: null } });
    } else if (target === "area" && areaId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.AREA, areaId, projectId: null, resourceCollectionId: null, archivedAt: null } });
    } else if (target === "resource" && collectionId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.RESOURCE, resourceCollectionId: collectionId, projectId: null, areaId: null, archivedAt: null } });
    } else if (target === "archive") {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.ARCHIVE, archivedAt: new Date(), projectId: null, areaId: null, resourceCollectionId: null } });
    } else if (target === "inbox") {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.INBOX, projectId: null, areaId: null, resourceCollectionId: null, archivedAt: null } });
    } else if (target === "ai") {
      const item = await prisma.item.findUnique({ where: { id: itemId, userId } });
      if (!item) return;
      const decision = await analyzeParaCapture({ text: `${item.title}\n${item.details ?? ""}` });
      await prisma.item.update({
        where: { id: itemId, userId },
        data: {
          title: decision.title || item.title,
          details: decision.details || item.details,
          classification: decision.classification,
          type: decision.type ?? item.type,
          projectId: null,
          areaId: null,
          resourceCollectionId: null,
          archivedAt: decision.classification === ItemClassification.ARCHIVE ? new Date() : null,
        },
      });
    }
    redirect("/review?step=1");
  }

  async function applyProjectDecisions(formData: FormData) {
    "use server";
    try {
      const entries = Array.from(formData.entries()).filter(([key]) => key.startsWith("decision-")) as [string, FormDataEntryValue][];
      const decisions = entries.map(([key, value]) => ({ id: key.replace("decision-", ""), status: value as ProjectStatus })).filter((d) => d.id && Object.values(ProjectStatus).includes(d.status));
      if (!decisions.length) {
        redirect("/review?step=3");
        return;
      }
      const desiredActive = decisions.filter((d) => d.status === ProjectStatus.ACTIVE).length;
      const remainingActive = await prisma.project.count({ where: { userId, status: ProjectStatus.ACTIVE, archivedAt: null, NOT: { id: { in: decisions.map((d) => d.id) } } } });
      if (desiredActive + remainingActive > 7) {
        redirect("/review?step=2&error=project_limit");
        return;
      }
      await Promise.all(decisions.map((d) => prisma.project.update({ where: { id: d.id, userId }, data: { status: d.status } })));
      redirect("/review?step=3");
    } catch (error) {
      logger.error("Error applying project decisions", error);
      redirect("/review?step=2&error=update_failed");
    }
  }

  async function toSummary(formData: FormData) {
    "use server";
    try {
      const scores: { areaId: string; score: number }[] = [];
      const nextActions: { areaId: string; title: string; details: string | null; url: string | null }[] = [];
      formData.forEach((value, key) => {
        if (key.startsWith("area-")) {
          const areaId = key.replace("area-", "");
          if (areaId) {
            const score = Number(value);
            if (Number.isFinite(score) && score >= 1 && score <= 5) {
              scores.push({ areaId, score });
            }
          }
        }
        if (key.startsWith("next-")) {
          const areaId = key.replace("next-", "");
          const title = String(value ?? "").trim();
          if (title && areaId) {
            const details = String(formData.get(`details-${areaId}`) ?? "").trim() || null;
            const url = String(formData.get(`url-${areaId}`) ?? "").trim() || null;
            nextActions.push({ areaId, title, details, url });
          }
        }
      });
      if (scores.length !== areas.length) {
        redirect("/review?step=3&error=score_all");
        return;
      }
      if (nextActions.length) {
        await Promise.all(
          nextActions.map((n) =>
            prisma.item.create({ data: { userId, title: n.title, details: n.details, url: n.url, type: ItemType.TASK, classification: ItemClassification.AREA, areaId: n.areaId } })
          )
        );
      }
      const avg = scores.length > 0 ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length : 0;
      const encoded = encodeURIComponent(scores.map((s) => `${s.areaId}:${s.score}`).join(","));
      redirect(`/review?step=4&scores=${encoded}&avg=${avg}`);
    } catch (error) {
      logger.error("Error in review summary", error);
      redirect("/review?step=3&error=summary_failed");
    }
  }

  async function finishReview(formData: FormData) {
    "use server";
    try {
      const scoresRaw = String(formData.get("scores") ?? "");
      if (!scoresRaw) {
        redirect("/review?step=4&error=missing_scores");
        return;
      }
      let pairs: string[];
      try {
        pairs = decodeURIComponent(scoresRaw).split(",").filter(Boolean);
      } catch {
        redirect("/review?step=4&error=invalid_scores");
        return;
      }
      const areaScores = pairs
        .map((pair) => {
          const [areaId, scoreStr] = pair.split(":");
          if (!areaId || !scoreStr) return null;
          const score = Number(scoreStr);
          if (!Number.isFinite(score) || score < 1 || score > 5) return null;
          return { areaId, score };
        })
        .filter((s): s is { areaId: string; score: number } => s !== null);
      const [currentInbox, currentActive] = await Promise.all([
        prisma.item.count({ where: { userId, classification: ItemClassification.INBOX, archivedAt: null } }),
        getActiveProjectCount(userId),
      ]);

      if (areaScores.length) {
        await Promise.all(
          areaScores.map(({ areaId, score }) =>
            prisma.area.update({ where: { id: areaId, userId }, data: { lastHealthScore: score, lastReviewDate: new Date() } })
          )
        );
      }
      const areaHealthAverage = areaScores.length > 0 ? areaScores.reduce((a, b) => a + b.score, 0) / areaScores.length : null;
      await prisma.weeklyReview.create({
        data: {
          userId,
          inboxCount: currentInbox,
          activeProjectsCount: currentActive,
          areaHealthAverage,
        },
      });
      redirect("/home");
    } catch (error) {
      logger.error("Error finishing review", error);
      redirect("/review?step=4&error=finish_failed");
    }
  }

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
