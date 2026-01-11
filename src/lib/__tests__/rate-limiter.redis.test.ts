// Integration test for Redis-backed isAllowed limiter
// This test requires a Redis server reachable via REDIS_URL (default redis://127.0.0.1:6379)

process.env.REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

import { isAllowed } from "../rate-limiter";

describe("Redis-backed isAllowed integration", () => {
  jest.setTimeout(20000);

  const key = `test:redis:${Date.now()}`;
  const limit = 5;
  const windowMs = 2000;

  it("allows up to limit then blocks", async () => {
    const results: boolean[] = [];
    for (let i = 0; i < limit + 1; i++) {
      // eslint-disable-next-line no-await-in-loop
      const allowed = await isAllowed(key, limit, windowMs);
      results.push(allowed);
    }
    expect(results.slice(0, limit).every(Boolean)).toBe(true);
    expect(results[limit]).toBe(false);
  });

  it("resets after window", async () => {
    // wait for the window to expire
    await new Promise((r) => setTimeout(r, windowMs + 200));
    const allowed = await isAllowed(key, limit, windowMs);
    expect(allowed).toBe(true);
  });
});
