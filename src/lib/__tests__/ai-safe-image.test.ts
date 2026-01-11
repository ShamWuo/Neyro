import { analyzeParaCaptureSafe } from "../ai-safe";
import * as promptLogger from "../prompt-logger";

jest.mock("../prompt-logger");

describe("analyzeParaCaptureSafe image URL handling", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    delete process.env.GEMINI_API_KEY;
    delete process.env.GAI_API_KEY;
  });

  it("strips unsafe external image URLs before sending to AI", async () => {
    const spy = jest.spyOn(promptLogger, "logPrompt");
    const unsafe = "http://127.0.0.1/secret.png";
    const res = await analyzeParaCaptureSafe({ text: "Note", imageUrl: unsafe });
    expect(res).toBeDefined();
    expect(spy).toHaveBeenCalled();
    const logged = (spy.mock.calls[0][0] as string);
    expect(logged).toContain("[REMOVED_UNSAFE]");
  });
});
