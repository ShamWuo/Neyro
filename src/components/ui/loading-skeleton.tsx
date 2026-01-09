export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-[var(--surface-muted)] rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-[var(--surface-muted)] rounded w-1/2"></div>
    </div>
  );
}

export function ItemSkeleton() {
  return (
    <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)]/80 p-3 space-y-3 animate-pulse">
      <div className="h-5 bg-[var(--surface-muted)] rounded w-3/4"></div>
      <div className="h-4 bg-[var(--surface-muted)] rounded w-full"></div>
      <div className="h-4 bg-[var(--surface-muted)] rounded w-2/3"></div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="panel animate-pulse">
      <div className="h-6 bg-[var(--surface-muted)] rounded w-1/3 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-[var(--surface-muted)] rounded w-full"></div>
        <div className="h-4 bg-[var(--surface-muted)] rounded w-5/6"></div>
        <div className="h-4 bg-[var(--surface-muted)] rounded w-4/6"></div>
      </div>
    </div>
  );
}

