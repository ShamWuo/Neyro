import { LoadingState } from "@/components/loading-state";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] p-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-4">
          <div className="h-8 w-64 bg-[var(--surface-muted)] rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-[var(--surface-muted)] rounded animate-pulse"></div>
        </div>
        <LoadingState type="card" />
      </div>
    </div>
  );
}
