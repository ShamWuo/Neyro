/**
 * Rate limiter with optional Redis backend and in-memory fallback.
 * Redis usage (recommended in production): set `REDIS_URL` env var.
 */

// import { env } from "./env";
const redisClient: unknown = null;
// Redis temporarily disabled for Edge compatibility
/*
try {
  if (env.REDIS_URL) {
     // ...
  }
} catch (e) {
  // ...
}
*/

const store: Map<string, number[]> = new Map();

export async function isAllowed(key: string, limit = 6, windowMs = 60_000): Promise<boolean> {
  /*
  if (redisClient) {
    try {
      const redisKey = `rl:${key}`;
      const count = await redisClient.incr(redisKey);
      if (count === 1) {
        await redisClient.pexpire(redisKey, windowMs);
      }
      return count <= limit;
    } catch (e) {
      // On Redis errors, fall back to in-memory implementation
      // eslint-disable-next-line no-console
      console.warn("Redis rate limiter error, falling back:", (e as Error)?.message || e);
    }
  }
  */

  // In-memory fallback
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = store.get(key) || [];
  const recent = timestamps.filter((t) => t > windowStart);
  if (recent.length >= limit) {
    store.set(key, recent);
    return false;
  }
  recent.push(now);
  store.set(key, recent);
  return true;
}

export function resetRateLimiter() {
  store.clear();
  /*
  if (redisClient) {
    try {
      redisClient.flushdb().catch(() => { });
    } catch { }
  }
  */
}

export function getCounts(key: string) {
  return (store.get(key) || []).length;
}

export async function getLimiterStatus() {
  const inMemoryKeys = store.size;
  if (!redisClient) {
    return { redisAvailable: false, inMemoryKeys };
  }
  /*
  try {
    const pong = await redisClient.ping();
    let info: string | null = null;
    try {
      info = await redisClient.info();
    } catch {
      info = null;
    }
    return { redisAvailable: true, pong, info, inMemoryKeys };
  } catch (e) {
    return { redisAvailable: false, error: (e as Error)?.message || String(e), inMemoryKeys };
  }
  */
  return { redisAvailable: false, inMemoryKeys };
}

export default isAllowed;
