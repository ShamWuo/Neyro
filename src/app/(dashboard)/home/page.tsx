import { redirect } from "next/navigation";

export default async function Home() {
  // Redirect to inbox - inbox is now the home page
  redirect("/inbox");
}

          url,
          type: ItemType.NOTE,
          classification: ItemClassification.INBOX,
        },
      });
      redirect("/inbox");
    } catch (error) {
      logger.error("Error creating item", error);
      redirect("/inbox?error=create_failed");
    }
  }

  const projectLoad = Math.min(activeProjects / 7, 1);
  const lastReviewDate = lastReview ? lastReview.completedAt.toISOString().slice(0, 10) : null;
  const projectsRemaining = Math.max(7 - activeProjects, 0);
  const now = new Date();
  const daysSinceReview = lastReview ? Math.floor((now.getTime() - lastReview.completedAt.getTime()) / 86400000) : null;
  const reviewStatus = !lastReview ? "No review yet" : daysSinceReview !== null && daysSinceReview <= 7 ? "On cadence" : `${daysSinceReview ? daysSinceReview - 7 : 0} days overdue`;

  function weekStart(date: Date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = d.getUTCDay();
    const diff = (day + 6) % 7; // Monday start
    d.setUTCDate(d.getUTCDate() - diff);
    return d;
  }

  const expectedWeek = weekStart(now);
  let streak = 0;
  for (const review of recentReviews) {
    const reviewWeek = weekStart(review.completedAt);
    const weeksDiff = Math.round((expectedWeek.getTime() - reviewWeek.getTime()) / (7 * 86400000));
    if (weeksDiff === streak) {
      streak += 1;
    } else if (weeksDiff > streak) {
      break;
    }
  }
  const nextReviewDue = lastReview ? new Date(lastReview.completedAt.getTime() + 7 * 86400000) : null;
  const nextReviewLabel = nextReviewDue ? nextReviewDue.toISOString().slice(0, 10) : "Schedule now";
  const upcomingDeadlines = activeProjectsList.filter((p) => p.deadline).slice(0, 3);
  const recentActivity = recentReviews.slice(0, 5);
  const formatDate = (date?: Date | null) => (date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No date");

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[radial-gradient(circle_at_10%_10%,rgba(87,114,255,0.16),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(255,155,108,0.15),transparent_35%),linear-gradient(135deg,var(--card),var(--card-muted))] p-6 shadow-[var(--elev-2)]">
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.9fr] md:items-center">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Welcome back, {name}</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Capture everything first. Sort it into PARA later.</h1>
            <p className="text-sm text-[var(--text-secondary)]">This cockpit is for fast capture. Drop tasks, links, and notes in seconds, then classify them into Projects, Areas, Resources, or Archive when you review.</p>
            <div className="flex flex-wrap gap-2 text-sm font-semibold">
              <Link href="/inbox" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-[var(--text-inverse)] shadow-sm transition hover:shadow-[var(--elev-3)]">Capture to inbox</Link>
              <Link href="/focus" className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-[var(--text-primary)] transition hover:border-[var(--border-strong)]">Start a focus block</Link>
              <Link href="/review" className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-[var(--text-primary)] transition hover:border-[var(--border-strong)]">Run weekly review</Link>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-[var(--text-tertiary)]">
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1">Capture → classify once daily</span>
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1">Cmd/Ctrl + K jumps to capture</span>
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1">Keep {projectsRemaining} project slots free</span>
            </div>

            <div id="quick-capture" className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 shadow-[var(--elev-1)]">
              <div className="flex items-center justify-between text-sm font-semibold text-[var(--text-primary)]">
                <span>Quick capture</span>
                <span className="text-xs text-[var(--text-secondary)]">Inbox now, classify later</span>
              </div>
              <form action={quickCapture} className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <input
                  name="title"
                  placeholder="Task, note, or link"
                  className="border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 md:col-span-1"
                  required
                />
                <input
                  name="url"
                  placeholder="URL (optional)"
                  className="border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 md:col-span-1"
                />
                <button type="submit" className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--border-strong)] md:col-span-1">Capture to inbox</button>
              </form>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">Tip: capture first, then batch classify to Projects/Areas/Resources/Archive during your daily sweep.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 shadow-[var(--elev-1)]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              <span>Momentum</span>
              <span className="rounded-full border border-[var(--border-subtle)] px-2 py-1 text-[10px] text-[var(--text-secondary)]">Streak {streak}w</span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card-muted)] p-3">
                <div className="text-xs font-semibold text-[var(--text-tertiary)]">Review cadence</div>
                <div className="text-2xl font-semibold text-[var(--text-primary)]">{lastReviewDate ?? "Not yet"}</div>
                <p className="text-xs text-[var(--text-secondary)]">{reviewStatus}</p>
                <p className="text-[11px] text-[var(--text-tertiary)]">Next due: {nextReviewLabel}</p>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card-muted)] p-3">
                <div className="text-xs font-semibold text-[var(--text-tertiary)]">Project cap</div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold text-[var(--text-primary)]">{activeProjects}/7</span>
                  <span className="text-[11px] text-[var(--text-secondary)]">{projectsRemaining} open</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                  <div className={`${activeProjects >= 7 ? "bg-[var(--danger)]" : "bg-[var(--primary-strong)]"} h-full transition-[width] duration-300`} style={{ width: `${projectLoad * 100}%` }} />
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)]">{activeProjects >= 7 ? "Over cap — archive or finish one." : "Stay under seven to keep focus."}</p>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--card-muted)] p-3 text-xs text-[var(--text-secondary)]">
              <div className="font-semibold text-[var(--text-primary)]">What to do now</div>
              <ul className="mt-2 space-y-1 list-disc pl-4">
                <li>Capture one thing then classify it.</li>
                <li>{activeProjects >= 7 ? "Close or archive a project." : "Keep projects under seven."}</li>
                <li>{lastReview ? "Log your weekly review." : "Run your first review."}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <CapturePlus />

      <div className="panel space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Sort captures into PARA</h2>
          <Link href="/plan" className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Open PARA overview</Link>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">Every capture should land in one of the four PARA buckets. Use this grid to decide where it goes.</p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-[var(--elev-1)]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              <span>Projects</span>
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">{activeProjects} active</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">Short-term outcomes with deadlines.</p>
            <p className="text-xs text-[var(--text-secondary)]">Examples: Finalize Q4 budget, Write a blog post, Fix the kitchen sink, Plan a summer vacation.</p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">If it has a deadline, it belongs here.</p>
            <Link href="/projects" className="mt-3 inline-flex rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)]">Go to Projects</Link>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-[var(--elev-1)]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              <span>Areas</span>
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">{areasCount} active</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">Ongoing responsibilities with standards.</p>
            <p className="text-xs text-[var(--text-secondary)]">Examples: Health, Finances, Professional Development, Parenting, Car Maintenance.</p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">No end date—just upkeep.</p>
            <Link href="/areas" className="mt-3 inline-flex rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)]">Go to Areas</Link>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-[var(--elev-1)]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              <span>Resources</span>
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">{resourcesCount} collections</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">References and interests to reuse.</p>
            <p className="text-xs text-[var(--text-secondary)]">Examples: Interior design, Web development, Cooking recipes, SEO strategy, Yoga.</p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">Your library—no immediate action.</p>
            <Link href="/resources" className="mt-3 inline-flex rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)]">Go to Resources</Link>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-[var(--elev-1)]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              <span>Archives</span>
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">{archiveCount} stored</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">Completed or inactive items.</p>
            <p className="text-xs text-[var(--text-secondary)]">Examples: finished projects, closed areas, old references you no longer need in view.</p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">Hide distractions; keep history.</p>
            <Link href="/archive" className="mt-3 inline-flex rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)]">Go to Archives</Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
        <div className="panel space-y-2 border-[var(--primary-strong)] bg-[color-mix(in_srgb,var(--primary-strong)_8%,var(--surface))] shadow-[var(--elev-2)]">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            <span>Upgrade to Focus</span>
            <span className="rounded-full border border-[var(--primary-strong)] bg-[color-mix(in_srgb,var(--primary-strong)_15%,transparent)] px-2 py-1 text-[var(--primary-strong)]">Best value</span>
          </div>
          <div className="text-[var(--text-primary)]">Unlimited Smart Assist, advanced exports, and team sharing. Keep PARA under control with higher limits.</div>
          <div className="grid gap-2 text-sm text-[var(--text-secondary)] md:grid-cols-2">
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2">
              <div className="text-xs font-semibold text-[var(--text-primary)]">Credits</div>
              <div className="text-sm">Unlimited AI assist and classification.</div>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2">
              <div className="text-xs font-semibold text-[var(--text-primary)]">Exports</div>
              <div className="text-sm">PDF/email weekly review summaries.</div>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2">
              <div className="text-xs font-semibold text-[var(--text-primary)]">Teams</div>
              <div className="text-sm">Shared PARA spaces and roles.</div>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2">
              <div className="text-xs font-semibold text-[var(--text-primary)]">Timeline</div>
              <div className="text-sm">Activity trail and accountability streaks.</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            <Link href="/pricing" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-[var(--text-inverse)] shadow-sm transition hover:shadow-[var(--elev-2)]">Upgrade now</Link>
            <Link href="/assist" className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-[var(--text-primary)] hover:border-[var(--border-strong)]">Try Smart Assist</Link>
          </div>
        </div>

        <div className="panel space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Trial tracker</div>
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-primary)] font-semibold">Trial days left</span>
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--card)] px-2 py-1 text-xs">14-day trial</span>
            </div>
            <p className="mt-2">Upgrade to keep Smart Assist at full speed and unlock exports once your trial ends.</p>
            <div className="mt-3 flex gap-2 text-sm font-semibold">
              <Link href="/pricing" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-[var(--text-inverse)] shadow-sm transition hover:shadow-[var(--elev-2)]">See plans</Link>
              <Link href="/review" className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-[var(--text-primary)] hover:border-[var(--border-strong)]">Run weekly review</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="panel space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Review tracker</h2>
            <Link href="/review" className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Open weekly review</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card-muted)] p-3 text-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Streak</div>
              <div className="text-2xl font-semibold text-[var(--text-primary)]">{streak} weeks</div>
              <div className="text-xs text-[var(--text-secondary)]">Log a review this week to keep the streak alive.</div>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card-muted)] p-3 text-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Last review</div>
              <div className="text-2xl font-semibold text-[var(--text-primary)]">{lastReviewDate ?? "Not yet"}</div>
              <div className="text-xs text-[var(--text-secondary)]">Next due: {nextReviewLabel}</div>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card-muted)] p-3 text-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Prompts</div>
              <div className="text-xs text-[var(--text-secondary)]">Run the weekly wizard, capture wins, prune projects, refresh areas.</div>
              <div className="mt-2 flex gap-2 text-xs font-semibold">
                <Link href="/weekly-review" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Wizard</Link>
                <Link href="/review" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Manual</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="panel space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Focus streak</h2>
            <Link href="/focus" className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Enter focus</Link>
          </div>
          <div className="space-y-2 text-sm text-[var(--text-primary)]">
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card-muted)] p-3">
              <div className="font-semibold">Define today</div>
              <p className="text-xs text-[var(--text-secondary)]">Pick one project, pin three tasks, log one time box. This keeps PARA in motion.</p>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card-muted)] p-3">
              <div className="font-semibold">Rapid start</div>
              <p className="text-xs text-[var(--text-secondary)]">Go to Focus, set a daily project, then log a 25-minute block.</p>
              <div className="mt-2 flex gap-2 text-xs font-semibold">
                <Link href="/focus" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Open Focus</Link>
                <Link href="/inbox" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Grab tasks</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <div className="panel space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Inbox</div>
          <div className="text-3xl font-semibold text-[var(--text-primary)]">{inboxCount}</div>
          <div className="text-xs text-[var(--text-secondary)]">Everything starts here. {inboxCount === 0 ? "Drop something now." : "Process once per day."}</div>
          <Link href="/inbox" className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Open inbox</Link>
        </div>

        <div className={`panel space-y-2 ${activeProjects >= 7 ? "border-[var(--danger)]" : ""}`}>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            <span>Projects</span>
            <span className="text-[10px] text-[var(--text-secondary)]">Cap 7</span>
          </div>
          <div className="text-3xl font-semibold text-[var(--text-primary)]">{activeProjects}/7</div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--border-subtle)]">
            <div className={`${activeProjects >= 7 ? "bg-[var(--danger)]" : "bg-[var(--primary-strong)]"} h-full`} style={{ width: `${projectLoad * 100}%` }} />
          </div>
          <div className="text-xs text-[var(--text-secondary)]">{activeProjects >= 7 ? "Over cap - pause one before adding." : `${projectsRemaining} slots left.`}</div>
          <Link href="/projects" className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Manage projects</Link>
        </div>

        <div className="panel space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Areas</div>
          <div className="text-3xl font-semibold text-[var(--text-primary)]">{areasCount}</div>
          <div className="text-xs text-[var(--text-secondary)]">Keep standards healthy. {areasCount === 0 ? "Define your core areas." : "Touch each weekly."}</div>
          <Link href="/areas" className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Open areas</Link>
        </div>

        <div className="panel space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Resources</div>
          <div className="text-3xl font-semibold text-[var(--text-primary)]">{resourcesCount}</div>
          <div className="text-xs text-[var(--text-secondary)]">Tag references so projects stay lean. {resourcesCount === 0 ? "Create your first collection." : "Keep adding references."}</div>
          <Link href="/resources" className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Open resources</Link>
        </div>

        <div className="panel space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Archive</div>
          <div className="text-3xl font-semibold text-[var(--text-primary)]">{archiveCount}</div>
          <div className="text-xs text-[var(--text-secondary)]">Close loops weekly. Move done items here.</div>
          <Link href="/archive" className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Go to archive</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="panel space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Guided PARA flow</h2>
            <span className="text-xs text-[var(--text-secondary)]">Capture, classify into Projects/Areas/Resources/Archive, then Review</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2 rounded border border-[var(--border-subtle)] bg-[var(--card-muted)] p-3 text-sm">
              <div className="font-semibold text-[var(--text-primary)]">Capture and sort</div>
              <p className="text-xs text-[var(--text-secondary)]">Drop tasks and notes, then batch classify to Project, Area, Resource, or Archive.</p>
              <div className="flex gap-2 text-xs">
                <Link href="/inbox" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Inbox</Link>
                <Link href="/archive" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Archive</Link>
              </div>
            </div>
            <div className="space-y-2 rounded border border-[var(--border-subtle)] bg-[var(--card-muted)] p-3 text-sm">
              <div className="font-semibold text-[var(--text-primary)]">Work and review</div>
              <p className="text-xs text-[var(--text-secondary)]">Stay under seven projects, touch areas weekly, and publish a weekly review.</p>
              <div className="flex gap-2 text-xs">
                <Link href="/projects" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Projects</Link>
                <Link href="/areas" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Areas</Link>
                <Link href="/review" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Review</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="panel space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Onboarding steps</h2>
            <span className="text-xs text-[var(--text-secondary)]">Finish these first</span>
          </div>
          <ul className="space-y-2 text-sm text-[var(--text-primary)]">
            <li className="flex items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--card-muted)] px-3 py-2">
              <span>Add your first project</span>
              <Link href="/projects" className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Add</Link>
            </li>
            <li className="flex items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--card-muted)] px-3 py-2">
              <span>Define 3-5 areas</span>
              <Link href="/areas" className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Define</Link>
            </li>
            <li className="flex items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--card-muted)] px-3 py-2">
              <span>Capture 5 items into inbox</span>
              <Link href="/inbox" className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Capture</Link>
            </li>
            <li className="flex items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--card-muted)] px-3 py-2">
              <span>Run your first weekly review</span>
              <Link href="/review" className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Run</Link>
            </li>
            <li className="flex items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--card-muted)] px-3 py-2">
              <span>Take the 60s PARA tour</span>
              <Link href="/assist" className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Start</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="panel space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Active projects / nearest deadlines</h2>
            <Link href="/projects" className="text-xs font-semibold text-[var(--text-secondary)] underline">View all</Link>
          </div>
          <div className="space-y-2">
            {activeProjectsList.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm transition hover:-translate-y-[1px] hover:border-[var(--border-strong)] hover:shadow-[var(--elev-1)]"
              >
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">{p.name}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{p.outcome}</div>
                </div>
                <div className="text-xs text-[var(--text-secondary)]">{p.deadline ? p.deadline.toISOString().slice(0, 10) : "No deadline"}</div>
              </Link>
            ))}
            {activeProjectsList.length === 0 && (
              <div className="flex flex-col gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                <div className="font-semibold text-[var(--text-primary)]">No active projects yet.</div>
                <div>Start with one clear outcome, set a deadline, and keep under seven. Try a template or import sample data.</div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <Link href="/projects" className="rounded border border-[var(--border-subtle)] bg-[var(--card)] px-2 py-1">Create a project</Link>
                  <Link href="/templates" className="rounded border border-[var(--border-subtle)] bg-[var(--card)] px-2 py-1">Use a template</Link>
                  <Link href="/assist" className="rounded border border-[var(--border-subtle)] bg-[var(--card)] px-2 py-1">See guided tour</Link>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Upcoming deadlines</div>
              <div className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">
                {upcomingDeadlines.length === 0 && <p>No deadlines set yet.</p>}
                {upcomingDeadlines.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--card-muted)] px-3 py-2">
                    <div className="text-[var(--text-primary)]">{p.name}</div>
                    <div className="text-xs font-semibold text-[var(--text-secondary)]">{formatDate(p.deadline)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Recent activity</div>
              <SmartSuggestions />
              <div className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">
                {recentActivity.length === 0 && <p>Nothing logged yet. Run your first review.</p>}
                {recentActivity.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--card-muted)] px-3 py-2">
                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">Weekly review</div>
                      <div className="text-[11px] text-[var(--text-tertiary)]">Completed</div>
                    </div>
                    <div className="text-xs font-semibold text-[var(--text-secondary)]">{formatDate(r.completedAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Capture pipeline</h2>
              <span className="text-xs text-[var(--text-secondary)]">The PARA flow</span>
            </div>
            <ol className="space-y-2 text-sm text-[var(--text-primary)] list-decimal list-inside">
              <li>Capture everything into your <Link href="/inbox" className="font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Inbox</Link>.</li>
              <li>Classify daily into <Link href="/projects" className="font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Projects</Link>, <Link href="/areas" className="font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Areas</Link>, <Link href="/resources" className="font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Resources</Link>, or <Link href="/archive" className="font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Archive</Link>.</li>
              <li>Work from Projects and Focus blocks; keep Projects under seven to stay sharp.</li>
              <li>Run a weekly review to close loops and set next captures.</li>
            </ol>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <Link href="/inbox" className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-[var(--text-primary)] hover:border-[var(--border-strong)]">Open inbox</Link>
              <Link href="/review" className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-[var(--text-primary)] hover:border-[var(--border-strong)]">Run weekly review</Link>
              <Link href="/focus" className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-[var(--text-primary)] hover:border-[var(--border-strong)]">Start focus block</Link>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">Need a shortcut? Press Cmd/Ctrl + K then type &quot;capture&quot; to jump straight into the inbox form.</p>
          </div>

          <div className="panel space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Review streak</h2>
              <Link href="/weekly-review" className="text-xs font-semibold text-[var(--text-secondary)] underline">Open wizard</Link>
            </div>
            <div className="grid gap-2 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--card-muted)] px-3 py-2">
                <span>Current streak</span>
                <span className="font-semibold text-[var(--text-primary)]">{streak} weeks</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--card-muted)] px-3 py-2">
                <span>Last review</span>
                <span className="font-semibold text-[var(--text-primary)]">{lastReviewDate ?? "Not yet"}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--card-muted)] px-3 py-2">
                <span>Next due</span>
                <span className="font-semibold text-[var(--text-primary)]">{nextReviewLabel}</span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">Streaks keep your PARA loop honest. Add a 15-minute slot to run it weekly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
