"use client";

import { useState, useEffect } from "react";
import { useToast } from "./ui/toast";
import { logger } from "@/lib/logger";

export function ReferralPanel() {
  const [code, setCode] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCode() {
      try {
        const res = await fetch("/api/referrals");
        if (res.ok) {
          const data = await res.json();
          setCode(data.code);
          setUrl(data.url);
        }
      } catch (error) {
        logger.error("Error fetching referral code", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCode();
  }, []);

  const handleCopy = async () => {
    if (url) {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Referral link copied!",
        description: "Share this link with friends to get rewards.",
        variant: "success",
      });
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        toast({
          title: "Invite sent!",
          description: `We've sent an invite to ${email}`,
          variant: "success",
        });
        setEmail("");
      } else {
        throw new Error("Failed to send invite");
      }
    } catch (error) {
      toast({
        title: "Failed to send invite",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "danger",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-[var(--text-secondary)]">Loading...</div>;
  }

  return (
    <div className="space-y-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Refer Friends</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          Share Neyro with friends and both of you get rewards!
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={url || ""}
            readOnly
            className="flex-1 text-xs border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 rounded"
          />
          <button
            onClick={handleCopy}
            className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-1 text-xs font-semibold text-[var(--text-inverse)]"
          >
            Copy
          </button>
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Friend's email"
            className="flex-1 text-xs border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 rounded"
            required
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-1 text-xs font-semibold disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>

      {code && (
        <div className="text-xs text-[var(--text-tertiary)]">
          Your code: <span className="font-mono font-semibold">{code}</span>
        </div>
      )}
    </div>
  );
}

