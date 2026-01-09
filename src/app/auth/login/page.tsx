import { signIn } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function handleSignIn() {
  "use server";
  try {
    await signIn("google", { redirectTo: "/inbox" });
  } catch (error) {
    // NextAuth v5 signIn can throw a NEXT_REDIRECT error, which is expected
    // We need to re-throw it so Next.js can handle the redirect properly
    if (error && typeof error === "object" && "type" in error && error.type === "NEXT_REDIRECT") {
      throw error;
    }
    // For other errors, redirect to login page with error parameter
    console.error("Sign-in error:", error);
    redirect("/auth/login?error=SignInFailed");
  }
}

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6">
      <div className="grid max-w-4xl w-full gap-4 md:grid-cols-[1fr_0.9fr] items-stretch">
        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)] space-y-4">
          <h1 id="signin-heading" className="text-xl font-semibold text-[#0c1222]">Sign in</h1>
          {error && (
            <div className="rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
              {error === "SignInFailed" 
                ? "Failed to sign in. Please check your Google OAuth configuration and try again." 
                : `Error: ${error}`}
            </div>
          )}
          <form
            className="space-y-3"
            aria-labelledby="signin-heading"
            action={handleSignIn}
          >
            <button
              type="submit"
              aria-label="Sign in with your Google account"
              className="w-full rounded-md bg-[var(--primary-strong)] px-4 py-2 font-semibold text-[var(--text-inverse)] hover:bg-[var(--primary)] transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
            >
              Continue with Google
            </button>
          </form>
          <div className="text-sm text-[var(--text-secondary)]">
            Don&apos;t have access yet? <a href="/auth/register" className="text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Register</a>
          </div>
        </div>

        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)] space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Focus plan</div>
          <div className="text-lg font-semibold text-[#0c1222]">Upgrade for Smart Assist, exports, and team accountability.</div>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li>• Unlimited AI assist and classification</li>
            <li>• Weekly review exports (PDF/email)</li>
            <li>• Activity timeline and streaks</li>
            <li>• Shared PARA spaces for teams</li>
          </ul>
          <a href="/pricing" className="inline-flex items-center justify-center rounded-md border border-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--primary-strong)] hover:bg-[var(--primary-strong)] hover:text-[var(--text-inverse)] transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2" aria-label="View pricing plans">
            View pricing
          </a>
        </div>
      </div>
    </div>
  );
}
