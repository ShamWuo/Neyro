import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#111]">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 px-10 py-10">
          <div className="mx-auto max-w-6xl space-y-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
