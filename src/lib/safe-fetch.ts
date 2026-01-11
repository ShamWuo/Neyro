export type SafeFetchInit = RequestInit & { timeoutMs?: number };

export async function safeFetch(input: RequestInfo, init?: SafeFetchInit, attempts = 3) {
  const delays = [300, 600, 1200];
  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), init?.timeoutMs ?? 15_000);
    try {
      const merged = { ...(init || {}), signal: controller.signal } as RequestInit;
      const res = await fetch(input, merged);
      clearTimeout(timeout);
      if (res.ok) return res;
      // Retry on 5xx
      if (res.status >= 500 && i < attempts - 1) {
        await new Promise((r) => setTimeout(r, delays[i]));
        continue;
      }
      return res;
    } catch (err) {
      clearTimeout(timeout);
      if (i === attempts - 1) {
        // When failing finally, mask Authorization-like headers in any attached init for logging
        try {
          // eslint-disable-next-line no-console
          console.error("safeFetch: final error for", String(input));
        } catch (e) {}
        throw err;
      }
      await new Promise((r) => setTimeout(r, delays[i]));
    }
  }
  throw new Error("safeFetch: exhausted retries");
}

export default safeFetch;
