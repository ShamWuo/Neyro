import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-6xl">
          Capture Everything.
        </h1>
        <p className="text-lg text-[var(--text-secondary)]">
          Pour your mind out here. The AI will classify it into Projects, Areas, or Resources.
        </p>

        <form action={async (formData) => {
          "use server";
          const { saveClassifiedItem } = await import("@/components/home-actions");
          await saveClassifiedItem(formData);
        }} className="w-full space-y-4">
          <div className="relative">
            <textarea
              name="details"
              placeholder="What's on your mind?"
              className="w-full min-h-[150px] rounded-xl border border-[var(--border-strong)] bg-[var(--card)] p-4 text-lg shadow-sm placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-weak)]"
              required
            />
          </div>
          <input type="hidden" name="sourceMode" value="home-capture" />

          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--primary)] px-8 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Process with AI
          </button>
        </form>
      </div>
    </div>
  );
}
