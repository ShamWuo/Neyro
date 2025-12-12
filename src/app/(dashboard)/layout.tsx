import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { CommandPalette } from "@/components/command-palette";
import { ShortcutsModal } from "@/components/shortcuts-modal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <div className="flex min-h-screen bg-[radial-gradient(1200px_at_0%_0%,rgba(87,114,255,0.12),transparent_45%),radial-gradient(1200px_at_80%_10%,rgba(255,155,108,0.14),transparent_45%),linear-gradient(135deg,var(--bg),var(--surface-muted))]">
        <Sidebar />
        <div className="relative flex-1">
          <KeyboardShortcuts />
          <CommandPalette />
          <ShortcutsModal />
          <div className="sticky top-0 z-20 border-b border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] px-8 py-5 backdrop-blur-md">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Today</p>
                <h1 className="text-xl font-semibold text-[var(--text-primary)]">Keep PARA moving: Capture → Projects → Areas → Resources → Review.</h1>
                <p className="text-sm text-[var(--text-secondary)]">Stay under seven active projects, clear inbox daily, and publish a weekly review.</p>
                <Breadcrumbs />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                <Link href="/inbox" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-white shadow-sm transition hover:shadow-[var(--elev-2)]">Capture</Link>
                <Link href="/projects" className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-[var(--text-primary)] transition hover:border-[var(--border-strong)]">Projects</Link>
                <Link href="/review" className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-[var(--text-primary)] transition hover:border-[var(--border-strong)]">Weekly review</Link>
              </div>
            </div>
          </div>
          <main className="px-8 py-8">
            <div className="mx-auto max-w-6xl space-y-10">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
