import { analyzeParaCaptureSafe } from "../ai-safe";
import * as promptLogger from "../prompt-logger";

jest.mock("../prompt-logger");

describe("analyzeParaCaptureSafe", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Ensure no API key is set so analyzeParaCapture returns fallback
    delete process.env.GEMINI_API_KEY;
    delete process.env.GAI_API_KEY;
  });

  it("logs sanitized prompt and returns fallback classification when no API key", async () => {
    const spy = jest.spyOn(promptLogger, "logPrompt");
    const res = await analyzeParaCaptureSafe({ text: "Contact me at test@example.com" });
    expect(res).toBeDefined();
    expect(res.title).toBeTruthy();
    expect(spy).toHaveBeenCalled();
    const logged = (spy.mock.calls[0][0] as string);
    expect(logged).toContain("[REDACTED_EMAIL]");
  });
});
