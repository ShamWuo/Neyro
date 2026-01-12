import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PlanOverview() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const [inboxCount, activeProjects, areasCount, resourcesCount, archiveCount] = await Promise.all([
    prisma.item.count({ where: { userId, classification: ItemClassification.INBOX, archivedAt: null } }),
    prisma.project.count({ where: { userId, status: ProjectStatus.ACTIVE, archivedAt: null } }),
    prisma.area.count({ where: { userId, archivedAt: null } }),
    prisma.resourceCollection.count({ where: { userId, archivedAt: null } }),
    prisma.item.count({ where: { userId, classification: ItemClassification.ARCHIVE } }),
  ]);

  const categories = [
    {
      key: "projects",
      title: "Projects",
      definition: "A series of tasks linked to a goal, with a deadline.",
      examples: "Finalize Q4 budget, Write a blog post, Fix the kitchen sink, Plan a summer vacation.",
      countLabel: `${activeProjects} active`,
      href: "/projects",
      badge: "Deadline-driven",
    },
    {
      key: "areas",
      title: "Areas",
      definition: "A sphere of activity with a standard to be maintained over time.",
      examples: "Health, Finances, Professional Development, Parenting, Car Maintenance.",
      countLabel: `${areasCount} active`,
      href: "/areas",
      badge: "Ongoing",
    },
    {
      key: "resources",
      title: "Resources",
      definition: "A topic or interest of ongoing interest.",
      examples: "Interior design, Web development, Cooking recipes, SEO strategy, Yoga.",
      countLabel: `${resourcesCount} collections`,
      href: "/resources",
      badge: "Library",
    },
    {
      key: "archive",
      title: "Archives",
      definition: "Inactive items from the other three categories.",
      examples: "Completed projects, Areas you are no longer responsible for, Resources you are no longer interested in.",
      countLabel: `${archiveCount} stored`,
      href: "/archive",
      badge: "History",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[radial-gradient(circle_at_10%_10%,rgba(87,114,255,0.16),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(255,155,108,0.15),transparent_35%),linear-gradient(135deg,var(--card),var(--card-muted))] p-6 shadow-[var(--elev-2)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">PARA overview</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Capture once, sort into Projects, Areas, Resources, Archives.</h1>
            <p className="text-sm text-[var(--text-secondary)]">Inbox everything, then classify daily. Keep projects under seven, maintain your areas, grow your resources, and archive whats done.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            <Link href="/inbox" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-[var(--text-inverse)] shadow-sm transition hover:shadow-[var(--elev-2)]">Capture now</Link>
            <Link href="/review" className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-[var(--text-primary)] transition hover:border-[var(--border-strong)]">Run weekly review</Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((cat) => (
          <div key={cat.key} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-[var(--elev-1)]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              <span>{cat.title}</span>
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">{cat.countLabel}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{cat.definition}</p>
            <p className="text-xs text-[var(--text-secondary)]">Examples: {cat.examples}</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">{cat.badge}</p>
            <Link href={cat.href} className="mt-3 inline-flex rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)]">Open {cat.title}</Link>
          </div>
        ))}
      </div>

      <div className="panel space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Your PARA tree</h2>
          <span className="text-xs text-[var(--text-secondary)]">Inbox feeds all four buckets</span>
        </div>
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 text-sm text-[var(--text-primary)] shadow-inner">
          <ul className="space-y-3">
            <li>
              <div className="flex items-center gap-2">
                <span className="rounded bg-[var(--surface-muted)] px-2 py-1 text-xs font-semibold text-[var(--text-secondary)]">Inbox</span>
                <span className="text-xs text-[var(--text-tertiary)]">{inboxCount} items ready to classify</span>
                <Link href="/inbox" className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Open inbox</Link>
              </div>
              <ul className="mt-2 space-y-2 border-l border-[var(--border-subtle)] pl-4 text-xs text-[var(--text-secondary)]">
                <li className="flex items-center justify-between">
                  <span className="text-[var(--text-primary)]">Projects (deadline-bound)</span>
                  <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--card)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">{activeProjects}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[var(--text-primary)]">Areas (ongoing standards)</span>
                  <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--card)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">{areasCount}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[var(--text-primary)]">Resources (reference library)</span>
                  <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--card)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">{resourcesCount}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[var(--text-primary)]">Archives (completed/parked)</span>
                  <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--card)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">{archiveCount}</span>
                </li>
              </ul>
            </li>
          </ul>
          <p className="mt-3 text-xs text-[var(--text-tertiary)]">Tip: classify daily. If it has a deadline, it is a Project. If it is an ongoing responsibility, it is an Area. If it is a reference, it is a Resource. When done, move it to Archives.</p>
        </div>
      </div>
    </div>
  );
}
