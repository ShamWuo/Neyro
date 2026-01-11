import { POST } from "../weekly-review/route";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findMany: jest.fn() },
    item: { count: jest.fn() },
    project: { count: jest.fn() },
    area: { findMany: jest.fn() },
    weeklyReview: { create: jest.fn() },
  },
}));

import { prisma } from "@/lib/prisma";

class MockRequest {
  headers: Headers;
  private _body: any;
  constructor(body?: any, headers?: Record<string,string>) {
    this.headers = new Headers(headers || {});
    this._body = body;
  }
  async json() { return this._body; }
}

describe("POST /api/cron/weekly-review", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 without token", async () => {
    process.env.ADMIN_TOKEN = "secret";
    const req = new MockRequest({});
    const res = await POST(req as unknown as Request);
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("creates weekly review for specific user", async () => {
    process.env.ADMIN_TOKEN = "secret";
    (prisma.item.count as jest.Mock).mockResolvedValue(5);
    (prisma.project.count as jest.Mock).mockResolvedValue(2);
    (prisma.area.findMany as jest.Mock).mockResolvedValue([{ lastHealthScore: 80 }, { lastHealthScore: 60 }]);
    (prisma.weeklyReview.create as jest.Mock).mockResolvedValue({ id: 'w1' });

    const req = new MockRequest({ userId: 'user-1' }, { 'x-admin-token': 'secret' });
    const res = await POST(req as unknown as Request);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.results[0].created).toBe(true);
    expect(prisma.weeklyReview.create).toHaveBeenCalled();
  });
});
