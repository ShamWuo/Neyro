"use client";

import { useState, useEffect } from "react";

type AIStatusIndicatorProps = {
  className?: string;
};

export function AIStatusIndicator({ className = "" }: AIStatusIndicatorProps) {
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        // Test if AI is available by making a test request
        const res = await fetch("/api/dev/assist-test", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ text: "test" }),
        });

        if (res.ok) {
          const data = await res.json();
          setAiEnabled(data.aiEnabled === true);
        } else {
          setAiEnabled(false);
        }
      } catch {
        setAiEnabled(false);
      } finally {
        setChecking(false);
      }
    };

    checkAIStatus();
  }, []);

  if (checking) {
    return (
      <div className={`text-xs text-[var(--text-tertiary)] ${className}`}>
        Checking AI status...
      </div>
    );
  }

  if (aiEnabled === false) {
    return (
      <div className={`rounded-md border border-[var(--warning)] bg-[var(--warning-weak)] px-2 py-1 text-xs text-[var(--warning)] ${className}`}>
        <span className="font-semibold">AI not configured</span> - Using fallback classification
      </div>
    );
  }

  return (
    <div className={`rounded-md border border-[var(--success)] bg-[var(--success-weak)] px-2 py-1 text-xs text-[var(--success)] ${className}`}>
      <span className="font-semibold">✓ AI enabled</span> - Smart classification active
    </div>
  );
}
