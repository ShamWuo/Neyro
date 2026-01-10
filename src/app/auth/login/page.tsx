"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  
  // Get error from URL after mount to avoid prerender issues
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    // Reading from URL after mount is intentional
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get("error");
      if (errorParam) {
        setError(errorParam);
      }
    }
  }, []);

  // Google OAuth is always available if configured server-side
  const hasGoogleOAuth = true;

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setError(null);
    
    // signIn redirects automatically - don't await it
    // The redirect will happen immediately, so we don't need to handle errors here
    signIn("google", { 
      callbackUrl: "/inbox",
      redirect: true 
    });
    
    // Note: We intentionally don't catch or set loading to false here
    // because the redirect happens synchronously and the page will navigate away
  }

  async function handleCredentialsSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setCredentialsError(null);

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setCredentialsError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setCredentialsError("Invalid email or password");
        setIsLoading(false);
      } else {
        router.push("/inbox");
        router.refresh();
      }
    } catch {
      setCredentialsError("Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6">
      <div className="grid max-w-4xl w-full gap-4 md:grid-cols-[1fr_0.9fr] items-stretch">
        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)] space-y-4">
          <h1 id="signin-heading" className="text-xl font-semibold text-[var(--text-primary)]">Sign in</h1>
          {error && (
            <div className="rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
              {error === "SignInFailed" 
                ? "Failed to sign in. Please try again." 
                : `Error: ${error}`}
            </div>
          )}
          {credentialsError && (
            <div className="rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
              {credentialsError}
            </div>
          )}

          {/* Google OAuth Button - Show first */}
          {hasGoogleOAuth && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                aria-label="Sign in with your Google account"
                className="w-full flex items-center justify-center gap-2 rounded-md border-2 border-[var(--border-default)] bg-white px-4 py-2.5 font-semibold text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-muted)] hover:border-[var(--primary-strong)] transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border-subtle)]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[var(--card)] px-2 text-[var(--text-tertiary)]">Or</span>
                </div>
              </div>
            </>
          )}

          {/* Email/Password Form */}
          <form
            className="space-y-3"
            aria-labelledby="signin-heading"
            onSubmit={handleCredentialsSignIn}
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-2 focus:outline-[var(--primary-strong)] focus:border-[var(--primary-strong)]"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-2 focus:outline-[var(--primary-strong)] focus:border-[var(--primary-strong)]"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              aria-label={isLoading ? "Signing you in..." : "Sign in to your account"}
              className="w-full rounded-md bg-[var(--primary-strong)] px-4 py-2.5 font-semibold text-white hover:bg-[var(--primary)] transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="text-sm text-[var(--text-secondary)]">
            Don&apos;t have an account? <Link href="/auth/register" className="text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Register</Link>
          </div>
        </div>

        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)] space-y-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Focus plan</div>
          <div className="text-lg font-semibold text-[var(--text-primary)] leading-relaxed">Upgrade for Smart Assist, exports, and team accountability.</div>
          <ul className="space-y-2 text-sm leading-relaxed text-[var(--text-primary)]">
            <li>• Unlimited AI assist and classification</li>
            <li>• Weekly review exports (PDF/email)</li>
            <li>• Activity timeline and streaks</li>
            <li>• Shared PARA spaces for teams</li>
          </ul>
          <Link href="/pricing" className="inline-flex items-center justify-center rounded-md border border-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--primary-strong)] hover:bg-[var(--primary-strong)] hover:text-[var(--text-inverse)] transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2" aria-label="View pricing plans">
            View pricing
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-sm text-[var(--text-secondary)]">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
