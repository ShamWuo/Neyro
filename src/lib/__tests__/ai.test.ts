import { sanitizePrompt } from "../ai";

describe("sanitizePrompt", () => {
  it("removes emails", () => {
    const input = "Contact me at alice@example.com for details.";
    expect(sanitizePrompt(input)).not.toContain("alice@example.com");
  });

  it("redacts common API keys and tokens", () => {
    const input = "Here is the key: sk_live_1234567890abcdef and api_key: ABC123";
    const out = sanitizePrompt(input);
    expect(out).not.toContain("sk_live_1234567890abcdef");
    expect(out).toMatch(/REDACTED/);
  });

  it("trims long random strings", () => {
    const long = "a".repeat(80);
    const out = sanitizePrompt(`secret=${long}`);
    expect(out).not.toContain(long);
  });
});
