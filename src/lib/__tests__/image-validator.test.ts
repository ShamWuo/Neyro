import { validateAndFetchImage } from "../image-validator";

jest.mock("../safe-fetch-url", () => {
  return jest.fn(async (url: string) => {
    if (url.includes("example.com/image.jpg")) {
      return {
        ok: true,
        headers: new Map([["content-type", "image/jpeg"]]),
        arrayBuffer: async () => Buffer.from("fake-image-data"),
      };
    }
    return { ok: false };
  });
});

describe("image-validator", () => {
  it("validates and fetches safe image URLs", async () => {
    const result = await validateAndFetchImage("https://example.com/image.jpg");
    expect(result).toBeDefined();
    expect(result?.mimeType).toContain("image");
    expect(result?.base64).toBeTruthy();
  });

  it("rejects unsafe image URLs", async () => {
    const result = await validateAndFetchImage("http://127.0.0.1/secret.jpg");
    expect(result).toBeNull();
  });
});
