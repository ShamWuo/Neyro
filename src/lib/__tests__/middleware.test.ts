import { middleware } from "@/middleware";

describe("middleware security headers", () => {
  it("applies expected security headers", async () => {
    const req: any = { nextUrl: { pathname: "/" } };
    const res: any = await middleware(req);
    expect(res).toBeDefined();
    const val = res.headers.get("X-Frame-Options");
    expect(val).toBe("SAMEORIGIN");
  });
});
