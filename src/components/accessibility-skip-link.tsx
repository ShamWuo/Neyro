export function SkipToMainContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:border focus:border-[var(--primary-strong)] focus:bg-[var(--primary-strong)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--text-inverse)]"
    >
      Skip to main content
    </a>
  );
}

