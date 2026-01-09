import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { CommandPalette } from "@/components/command-palette";
import { ShortcutsModal } from "@/components/shortcuts-modal";
import { UpgradeBanner } from "@/components/upgrade-banner";
import { SkipToMainContent } from "@/components/accessibility-skip-link";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { MobileFAB } from "@/components/mobile-fab";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]" data-theme="light">
      <SkipToMainContent />
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
                <Link href="/inbox" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-[var(--text-inverse)] shadow-sm transition hover:shadow-[var(--elev-2)]">Capture</Link>
                <Link href="/projects" className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-[var(--text-primary)] transition hover:border-[var(--border-strong)]">Projects</Link>
                <Link href="/review" className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-[var(--text-primary)] transition hover:border-[var(--border-strong)]">Weekly review</Link>
                <Link href="/pricing" className="rounded-md border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--primary-strong)_12%,var(--card))] px-4 py-2 text-[var(--primary-strong)] transition hover:bg-[color-mix(in_srgb,var(--primary-strong)_18%,var(--card))] hover:shadow-[var(--elev-1)]">Upgrade</Link>
              </div>
            </div>
            <UpgradeBanner />
          </div>
          <main id="main-content" className="px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8" role="main">
            <div className="mx-auto max-w-6xl space-y-10">{children}</div>
          </main>
        </div>
      </div>
      <MobileBottomNav />
      <MobileFAB />
    </div>
  );
}
