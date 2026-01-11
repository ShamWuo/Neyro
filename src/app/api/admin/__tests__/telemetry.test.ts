import { GET } from "../telemetry/route";

jest.mock("@/lib/prisma", () => ({ prisma: { activityLog: { findMany: jest.fn() } } }));
import { prisma } from "@/lib/prisma";

class MockRequest {
  headers: Headers;
  url = "http://localhost/api/admin/telemetry";
  constructor(headers?: Record<string,string>) {
    this.headers = new Headers(headers || {});
  }
}

describe("GET /api/admin/telemetry", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when no token provided", async () => {
    process.env.ADMIN_TOKEN = "secret";
    const req = new MockRequest();
    const res = await GET(req as unknown as Request);
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns entries when token matches", async () => {
    process.env.ADMIN_TOKEN = "secret";
    (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([{ id: 'a1', type: 'quick_capture' }]);
    const req = new MockRequest({ 'x-admin-token': 'secret' });
    const res = await GET(req as unknown as Request);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.items).toHaveLength(1);
  });
});
