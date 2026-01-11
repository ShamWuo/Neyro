import { Sidebar } from "@/components/sidebar";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { CommandPalette } from "@/components/command-palette";
import { ShortcutsModal } from "@/components/shortcuts-modal";
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
