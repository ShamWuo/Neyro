import { POST } from "../quick-capture/route";

jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({ prisma: { item: { create: jest.fn() }, activityLog: { create: jest.fn() } } }));
jest.mock("@/lib/rate-limiter", () => ({ isAllowed: jest.fn() }));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

class MockRequest {
  url: string;
  method: string;
  headers: Headers;
  private _body: unknown;

  constructor(url: string, init?: { method?: string; body?: unknown; headers?: HeadersInit }) {
    this.url = url;
    this.method = init?.method || "POST";
    this.headers = new Headers(init?.headers || {});
    this._body = init?.body;
  }

  async json() {
    return typeof this._body === "string" ? JSON.parse(this._body as string) : this._body;
  }
}

describe("POST /api/quick-capture", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    (auth as jest.Mock).mockResolvedValue(null);
    const req = new MockRequest("http://localhost/api/quick-capture", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }),
      headers: { "Content-Type": "application/json" },
    }) as unknown as Request;

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("creates an item when valid", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-1" } });
    (prisma.item.create as jest.Mock).mockResolvedValue({ id: "i1", title: "Test" });
    const { isAllowed } = require("@/lib/rate-limiter");
    (isAllowed as jest.Mock).mockResolvedValue(true);

    const req = new MockRequest("http://localhost/api/quick-capture", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }),
      headers: { "Content-Type": "application/json" },
    }) as unknown as Request;

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.id).toBe("i1");
    expect(prisma.item.create).toHaveBeenCalled();
    expect(prisma.activityLog.create).toHaveBeenCalled();
  });

  it("returns 429 when rate limit exceeded", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-1" } });
    const { isAllowed } = require("@/lib/rate-limiter");
    (isAllowed as jest.Mock).mockResolvedValue(false);

    const req = new MockRequest("http://localhost/api/quick-capture", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }),
      headers: { "Content-Type": "application/json" },
    }) as unknown as Request;

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(429);
    expect(json.error).toBe("Too many requests");
  });

  it("returns 400 for missing title", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-1" } });
    const req = new MockRequest("http://localhost/api/quick-capture", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    }) as unknown as Request;

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe("Title is required");
  });
});
