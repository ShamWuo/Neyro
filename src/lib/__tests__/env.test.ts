import { env } from "../env";

describe("env validation", () => {
  it("provides NODE_ENV", () => {
    expect(env.NODE_ENV).toBeDefined();
  });
});
