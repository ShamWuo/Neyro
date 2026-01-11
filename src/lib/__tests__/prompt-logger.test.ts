import fs from "fs";
import { logPrompt } from "../prompt-logger";

jest.mock("fs");

describe("logPrompt", () => {
  it("returns sanitized prompt and writes to file", () => {
    const appendSpy = jest.spyOn(fs, "appendFileSync").mockImplementation(() => {});
    const out = logPrompt("Contact: alice@example.com and key sk_live_ABC123");
    expect(out).not.toContain("alice@example.com");
    expect(out).toMatch(/REDACTED/);
    expect(appendSpy).toHaveBeenCalled();
    appendSpy.mockRestore();
  });

  it("returns raw prompt when redact=false", () => {
    const appendSpy = jest.spyOn(fs, "appendFileSync").mockImplementation(() => {});
    const raw = "Email: bob@example.com";
    const out = logPrompt(raw, { redact: false });
    expect(out).toContain("bob@example.com");
    expect(appendSpy).toHaveBeenCalled();
    appendSpy.mockRestore();
  });
});
