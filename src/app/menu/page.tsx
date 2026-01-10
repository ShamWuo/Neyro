import Link from "next/link";

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-4">
          <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Menu</h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Quick navigation to all features and sections of Neyro.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Core Features</h2>
            <nav className="space-y-2">
              <Link href="/inbox" className="block text-sm text-[var(--primary-strong)] hover:underline">
                Inbox
              </Link>
              <Link href="/projects" className="block text-sm text-[var(--primary-strong)] hover:underline">
                Projects
              </Link>
              <Link href="/areas" className="block text-sm text-[var(--primary-strong)] hover:underline">
                Areas
              </Link>
              <Link href="/resources" className="block text-sm text-[var(--primary-strong)] hover:underline">
                Resources
              </Link>
            </nav>
          </div>

          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Review & Planning</h2>
            <nav className="space-y-2">
              <Link href="/review" className="block text-sm text-[var(--primary-strong)] hover:underline">
                Weekly Review
              </Link>
              <Link href="/focus" className="block text-sm text-[var(--primary-strong)] hover:underline">
                Focus Mode
              </Link>
              <Link href="/analytics" className="block text-sm text-[var(--primary-strong)] hover:underline">
                Analytics
              </Link>
              <Link href="/activity" className="block text-sm text-[var(--primary-strong)] hover:underline">
                Activity
              </Link>
            </nav>
          </div>

          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Tools</h2>
            <nav className="space-y-2">
              <Link href="/assist" className="block text-sm text-[var(--primary-strong)] hover:underline">
                Smart Assist
              </Link>
              <Link href="/search" className="block text-sm text-[var(--primary-strong)] hover:underline">
                Search
              </Link>
              <Link href="/templates" className="block text-sm text-[var(--primary-strong)] hover:underline">
                Templates
              </Link>
              <Link href="/archive" className="block text-sm text-[var(--primary-strong)] hover:underline">
                Archive
              </Link>
            </nav>
          </div>

          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Settings</h2>
            <nav className="space-y-2">
              <Link href="/settings" className="block text-sm text-[var(--primary-strong)] hover:underline">
                User Settings
              </Link>
              <Link href="/pricing" className="block text-sm text-[var(--primary-strong)] hover:underline">
                Pricing
              </Link>
            </nav>
          </div>
        </section>
      </div>
    </main>
  );
}
