"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerWithCredentials } from "./actions";

function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const searchParams = useSearchParams();

  // Get error from URL after mount using useSearchParams
  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      // Use setTimeout to avoid synchronous setState warning
      const timer = setTimeout(() => {
        setError(errorParam);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

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

  async function handleCredentialsRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setCredentialsError(null);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setCredentialsError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setCredentialsError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setCredentialsError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerWithCredentials(
        formData.email,
        formData.password,
        formData.name || undefined
      );

      if (result?.error) {
        setCredentialsError(result.error);
        setIsLoading(false);
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setCredentialsError("Account created but failed to sign in. Please try signing in.");
        setIsLoading(false);
      } else {
        router.push("/inbox");
        router.refresh();
      }
    } catch (error) {
      // Handle Server Action hash mismatch errors
      if (error instanceof Error && error.message.includes("Failed to find Server Action")) {
        setCredentialsError("Please refresh the page and try again. If the problem persists, try clearing your browser cache.");
      } else {
        setCredentialsError("Failed to create account. Please try again.");
      }
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6">
      <div className="grid max-w-4xl w-full gap-4 md:grid-cols-[1fr_0.9fr] items-stretch">
        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)] space-y-4">
          <h1 id="register-heading" className="text-xl font-semibold text-[var(--text-primary)]">Create your account</h1>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">Get started with a free account. 14-day trial of Focus plan included.</p>
          {error && (
            <div className="rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
              {error === "SignInFailed"
                ? "Failed to create account. Please try again."
                : `Error: ${error}`}
            </div>
          )}
          {credentialsError && (
            <div className="rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
              {credentialsError}
            </div>
          )}

          {/* Email/Password Registration Form */}
          <form
            className="space-y-3"
            aria-labelledby="register-heading"
            onSubmit={handleCredentialsRegister}
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Name (optional)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-2 focus:outline-[var(--primary-strong)] focus:border-[var(--primary-strong)]"
                placeholder="Your name"
                disabled={isLoading}
              />
            </div>
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
                minLength={8}
              />
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">Must be at least 8 characters</p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-2 focus:outline-[var(--primary-strong)] focus:border-[var(--primary-strong)]"
                placeholder="••••••••"
                disabled={isLoading}
                minLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              aria-label={isLoading ? "Creating your account..." : "Create your account"}
              className="w-full rounded-md bg-[var(--primary-strong)] px-4 py-2.5 text-base font-semibold text-white hover:bg-[var(--primary)] transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: '#ffffff' }}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Divider */}
          {hasGoogleOAuth && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border-subtle)]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[var(--card)] px-2 text-[var(--text-tertiary)]">Or</span>
                </div>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                aria-label="Create account with your Google account"
                className="w-full flex items-center justify-center gap-2 rounded-md border-2 border-[var(--border-default)] bg-white px-4 py-2.5 font-semibold text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-muted)] hover:border-[var(--primary-strong)] transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </>
          )}

          <div className="text-sm text-[var(--text-secondary)]">
            Already have an account? <Link href="/auth/login" className="text-[var(--primary-strong)] underline hover:text-[var(--primary)]">Sign in</Link>
          </div>
        </div>

        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)] space-y-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">What you get in Focus</div>
          <div className="text-lg font-semibold text-[var(--text-primary)] leading-relaxed">Install PARA discipline with AI assist and exports.</div>
          <ul className="space-y-2 text-sm leading-relaxed text-[var(--text-primary)]">
            <li>• Unlimited Smart Assist actions</li>
            <li>• Weekly review exports to PDF/email</li>
            <li>• Project cap guardrails and timelines</li>
            <li>• Team sharing and streak accountability</li>
          </ul>
          <Link href="/pricing" className="inline-flex items-center justify-center rounded-md border border-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--primary-strong)] hover:bg-[var(--primary-strong)] hover:text-[var(--text-inverse)] transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2" aria-label="View pricing plans">
            View pricing
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-[var(--text-primary)]">Loading...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
