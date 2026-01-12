"use client";
import { useCallback, useEffect, useState } from "react";

type Quota = {
  active: number;
  limit: number;
  remaining: number;
  allowed: boolean;
};

export function useProjectQuota(pollIntervalMs = 0) {
  const [data, setData] = useState<Quota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/para/active-status", { credentials: "include" });
      if (!res.ok) throw new Error(`status:${res.status}`);
      const json = await res.json();
      setData({ active: json.active || 0, limit: json.limit || 0, remaining: json.remaining || 0, allowed: !!json.allowed });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuota();
    if (pollIntervalMs && pollIntervalMs > 0) {
      const id = setInterval(fetchQuota, pollIntervalMs);
      return () => clearInterval(id);
    }
     
  }, [fetchQuota, pollIntervalMs]);

  return { data, loading, error, refresh: fetchQuota };
}
