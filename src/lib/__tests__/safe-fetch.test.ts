import { safeFetch } from "@/lib/safe-fetch";

describe("safeFetch", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("retries on 5xx and eventually returns", async () => {
    const mock = jest.fn()
      .mockResolvedValueOnce({ ok: false, status: 502, text: async () => "" })
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => "ok" });
    // @ts-ignore
    global.fetch = mock;

    const res: any = await safeFetch("https://example.com/test", { method: "GET" }, 2);
    expect(res.status).toBe(200);
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting retries", async () => {
    const mock = jest.fn()
      .mockRejectedValue(new Error("network"));
    // @ts-ignore
    global.fetch = mock;

    await expect(safeFetch("https://example.com/fail", { method: "GET" }, 2)).rejects.toThrow();
  });
});
