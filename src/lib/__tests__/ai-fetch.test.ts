import { analyzeParaCapture } from "../ai";

describe("analyzeParaCapture (sanitization in outbound request)", () => {
  const origKey = process.env.GEMINI_API_KEY;
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-key";
  });
  afterEach(() => {
    process.env.GEMINI_API_KEY = origKey;
    jest.restoreAllMocks();
    // @ts-ignore
    delete (global as any).fetch;
  });

  it("sanitizes user text before sending to AI endpoint", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          { content: { parts: [{ text: '{"classification":"INBOX","title":"ok"}' }] } },
        ],
      }),
    });
    // @ts-ignore
    (global as any).fetch = fetchMock;

    const input = "Please contact me at alice@example.com for details";
    await analyzeParaCapture({ text: input });

    expect(fetchMock).toHaveBeenCalled();
    const init = fetchMock.mock.calls[0][1];
    expect(init).toBeDefined();
    expect(init.body).not.toContain("alice@example.com");
    expect(init.body).toContain("[REDACTED_EMAIL]");
  });
});
