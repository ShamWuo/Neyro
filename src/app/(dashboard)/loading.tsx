export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800" />
      <div>
        <p className="text-base font-semibold text-zinc-800">Loading your PARA workspace…</p>
        <p>We are fetching the latest inbox counts, project caps, and review stats.</p>
      </div>
    </div>
  );
}
