import { isAllowed, resetRateLimiter, getCounts } from "../rate-limiter";

describe("rate limiter", () => {
  beforeEach(() => resetRateLimiter());

  it("allows under limit and blocks after reaching limit", async () => {
    const key = "test-ip";
    const limit = 3;
    for (let i = 0; i < limit; i++) {
      // eslint-disable-next-line jest/valid-expect
      expect(await isAllowed(key, limit, 10000)).toBe(true);
    }
    // next one should be blocked
    expect(await isAllowed(key, limit, 10000)).toBe(false);
    expect(getCounts(key)).toBe(limit);
  });

  it("resets counts after window passes", async () => {
    const key = "t2";
    expect(await isAllowed(key, 2, 10)).toBe(true);
    expect(await isAllowed(key, 2, 10)).toBe(true);
    // after short wait, window expires
    jest.advanceTimersByTime?.(20);
    expect(await isAllowed(key, 2, 10)).toBe(true);
  });
});
