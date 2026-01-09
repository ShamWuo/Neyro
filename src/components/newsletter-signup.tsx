"use client";

import { useState, memo, useCallback } from "react";

export const NewsletterSignup = memo(function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    try {
      // Replace with your newsletter API endpoint
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        const data = await response.json().catch(() => ({ error: "Subscription failed" }));
        setStatus("error");
        // Provide specific error message if available
        if (data.error) {
          // Error message will be shown below
        }
      }
    } catch {
      setStatus("error");
      // Network or other errors are handled by generic message
    }
  }, [email]);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address for newsletter subscription
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          aria-required="true"
          aria-invalid={status === "error"}
          aria-describedby={status === "error" ? "newsletter-error" : undefined}
          className="flex-1 border border-[var(--border-default)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] shadow-sm transition hover:shadow-[var(--elev-1)] disabled:opacity-60"
        >
          {status === "loading" ? "..." : status === "success" ? "✓" : "Subscribe"}
        </button>
      </div>
      {status === "success" && (
        <p className="text-xs text-[var(--success)]" role="status" aria-live="polite">
          ✓ Thanks! Check your email to confirm your subscription.
        </p>
      )}
      {status === "error" && (
        <p id="newsletter-error" className="text-xs text-[var(--danger)]" role="alert" aria-live="assertive">
          ⚠ Unable to subscribe. Please check your email address and try again.
        </p>
      )}
    </form>
  );
});

