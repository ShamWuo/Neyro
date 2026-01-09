"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6">
          <div className="max-w-md space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold text-[var(--text-primary)]">Something went wrong</h1>
              <p className="text-sm text-[var(--text-secondary)]">We encountered an unexpected error. Please refresh the page.</p>
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-5 py-3 text-sm font-semibold text-[var(--text-inverse)] shadow-[var(--elev-1)] transition hover:-translate-y-[1px] hover:shadow-[var(--elev-2)]"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

