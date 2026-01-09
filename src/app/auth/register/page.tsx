import { signIn } from "@/auth";

export const dynamic = "force-dynamic";

async function handleSignIn() {
  "use server";
  await signIn("google", { redirectTo: "/inbox" });
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6">
      <div className="grid max-w-4xl w-full gap-4 md:grid-cols-[1fr_0.9fr] items-stretch">
        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)] space-y-4">
          <h1 id="register-heading" className="text-xl font-semibold text-[#0c1222]">Create your account</h1>
          <p className="text-sm text-[var(--text-secondary)]">14-day trial of Focus included.</p>
          <form
            className="space-y-3"
            aria-labelledby="register-heading"
            action={handleSignIn}
          >
            <button
              type="submit"
              aria-label="Create account with your Google account"
              className="w-full rounded-md bg-[var(--primary-strong)] px-4 py-2 font-semibold text-[var(--text-inverse)] hover:bg-[var(--primary)] transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
            >
              Continue with Google
            </button>
          </form>
          <div className="text-sm text-[var(--text-secondary)]">
            Already have an account? <a href="/auth/login" className="text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Sign in</a>
          </div>
        </div>

        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)] space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">What you get in Focus</div>
          <div className="text-lg font-semibold text-[#0c1222]">Install PARA discipline with AI assist and exports.</div>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li>• Unlimited Smart Assist actions</li>
            <li>• Weekly review exports to PDF/email</li>
            <li>• Project cap guardrails and timelines</li>
            <li>• Team sharing and streak accountability</li>
          </ul>
          <a href="/pricing" className="inline-flex items-center justify-center rounded-md border border-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--primary-strong)] hover:bg-[var(--primary-strong)] hover:text-[var(--text-inverse)] transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2" aria-label="View pricing plans">
            View pricing
          </a>
        </div>
      </div>
    </div>
  );
}
