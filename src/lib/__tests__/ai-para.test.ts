import { analyzeParaCapture } from "../ai";

describe("analyzeParaCapture fallback behavior", () => {
  it("returns a safe fallback when no AI key is configured", async () => {
    // Ensure environment does not provide an API key for this test
    const original = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GAI_API_KEY;
    try {
      const res = await analyzeParaCapture({ text: "Buy groceries tomorrow" });
      expect(res).toBeDefined();
      expect(res.classification).toBeDefined();
      expect(res.title).toContain("Buy groceries");
    } finally {
      if (original !== undefined) process.env.GEMINI_API_KEY = original;
    }
  });
});
