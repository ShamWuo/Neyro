type Bucket = {
  tokens: number;
  lastRefill: number;
};

const DEFAULT_MAX_TOKENS = 10; // burst
const REFILL_INTERVAL_MS = 60 * 1000; // refill period
const REFILL_TOKENS = 10; // tokens per interval

function getStore(): Map<string, Bucket> {
  // persist across HMR
  // @ts-expect-error allow attaching a dev-only store to globalThis
  if (!globalThis.__rateLimitStore) globalThis.__rateLimitStore = new Map<string, Bucket>();
  // @ts-expect-error dev-only store
  return globalThis.__rateLimitStore as Map<string, Bucket>;
}

export function takeToken(key: string, cost = 1) {
  const store = getStore();
  const now = Date.now();
  let b = store.get(key);
  if (!b) {
    b = { tokens: DEFAULT_MAX_TOKENS, lastRefill: now };
    store.set(key, b);
  }

  // refill
  const elapsed = now - b.lastRefill;
  if (elapsed >= REFILL_INTERVAL_MS) {
    const windows = Math.floor(elapsed / REFILL_INTERVAL_MS);
    const add = windows * REFILL_TOKENS;
    b.tokens = Math.min(DEFAULT_MAX_TOKENS, b.tokens + add);
    b.lastRefill = b.lastRefill + windows * REFILL_INTERVAL_MS;
  }

  if (b.tokens < cost) {
    const retryAfter = Math.ceil((REFILL_INTERVAL_MS - (now - b.lastRefill)) / 1000);
    const err = new Error("Too many requests") as Error & { status?: number; retryAfter?: number };
    err.status = 429;
    err.retryAfter = retryAfter;
    throw err;
  }

  b.tokens -= cost;
  store.set(key, b);
}

export function resetRateLimit(key: string) {
  getStore().delete(key);
}
