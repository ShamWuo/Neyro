import { GET } from "../active-status/route";
import { NextRequest } from "next/server";

jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/para", () => ({ getActiveProjectCount: jest.fn() }));
jest.mock("@/lib/subscription", () => ({ checkSubscriptionLimit: jest.fn() }));

import { auth } from "@/auth";
import { getActiveProjectCount } from "@/lib/para";
import { checkSubscriptionLimit } from "@/lib/subscription";

describe("/api/para/active-status", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    (auth as jest.Mock).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/para/active-status", { method: "GET" });
    const res = await GET(req as any);
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns quota info when authenticated", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-1" } });
    (getActiveProjectCount as jest.Mock).mockResolvedValue(3);
    (checkSubscriptionLimit as jest.Mock).mockResolvedValue({ allowed: true, limit: 7, current: 3 });

    const req = new NextRequest("http://localhost/api/para/active-status", { method: "GET" });
    const res = await GET(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.active).toBe(3);
    expect(json.limit).toBe(7);
    expect(json.remaining).toBe(4);
    expect(json.allowed).toBe(true);
  });
});
