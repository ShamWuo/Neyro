import Link from "next/link";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f2ff] text-[#0f172a]">
      <div className="flex min-h-screen bg-[radial-gradient(circle_at_15%_20%,rgba(93,95,239,0.25),transparent_45%),radial-gradient(circle_at_85%_15%,rgba(248,113,113,0.18),transparent_35%),linear-gradient(135deg,#f5f2ff,#fefbf5)]">
        <Sidebar />
        <div className="relative flex-1">
          <div className="sticky top-0 z-20 border-b border-white/50 bg-white/80 px-8 py-5 backdrop-blur">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7b83a0]">Today</p>
                  <h1 className="text-xl font-semibold">Work the PARA loop and keep your second brain trustworthy.</h1>
                </div>
                <div className="flex flex-wrap gap-2 text-sm font-semibold">
                  <Link href="/inbox" className="rounded-md border border-[#0f172a] bg-[#0f172a] px-4 py-2 text-white shadow-sm">Capture</Link>
                  <Link href="/projects" className="rounded-md border border-[#0f172a]/20 bg-white px-4 py-2 text-[#0f172a] hover:border-[#0f172a]">Projects</Link>
                  <Link href="/review" className="rounded-md border border-[#0f172a]/20 bg-white px-4 py-2 text-[#0f172a] hover:border-[#0f172a]">Weekly review</Link>
                </div>
              </div>
              <div className="grid gap-3 text-xs text-[#5f687d] sm:grid-cols-3">
                <div className="rounded-lg border border-white/60 bg-white/80 px-4 py-3 shadow-inner">
                  <p className="font-semibold text-[#0f172a]">Inbox first</p>
                  <p>Drop anything into /inbox, classify once per day.</p>
                </div>
                <div className="rounded-lg border border-white/60 bg-white/80 px-4 py-3 shadow-inner">
                  <p className="font-semibold text-[#0f172a]">Projects capped</p>
                  <p>Stay under seven active initiatives at all times.</p>
                </div>
                <div className="rounded-lg border border-white/60 bg-white/80 px-4 py-3 shadow-inner">
                  <p className="font-semibold text-[#0f172a]">Weekly rhythm</p>
                  <p>Run the wizard, publish a recap, update streaks.</p>
                </div>
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
