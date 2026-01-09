import { POST } from "../newsletter/route";
import { logger } from "@/lib/logger";

// Mock logger
jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  },
}));

// Mock NextRequest
class MockRequest {
  url: string;
  method: string;
  headers: Headers;
  private _body: unknown;

  constructor(url: string, init?: { method?: string; body?: unknown; headers?: HeadersInit }) {
    this.url = url;
    this.method = init?.method || "GET";
    this.headers = new Headers(init?.headers || {});
    this._body = init?.body;
  }

  async json() {
    return typeof this._body === "string" ? JSON.parse(this._body) : this._body;
  }

  async text() {
    return typeof this._body === "string" ? this._body : JSON.stringify(this._body);
  }
}

describe("POST /api/newsletter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns success for valid email", async () => {
    const request = new MockRequest("http://localhost:3000/api/newsletter", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
      headers: { "Content-Type": "application/json" },
    }) as unknown as Request;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(logger.info).toHaveBeenCalledWith("Newsletter signup", { email: "test@example.com" });
  });

  it("returns error for invalid email", async () => {
    const request = new MockRequest("http://localhost:3000/api/newsletter", {
      method: "POST",
      body: JSON.stringify({ email: "invalid-email" }),
      headers: { "Content-Type": "application/json" },
    }) as unknown as Request;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid email address");
  });

  it("returns error for missing email", async () => {
    const request = new MockRequest("http://localhost:3000/api/newsletter", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    }) as unknown as Request;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid email address");
  });

  it("handles errors gracefully", async () => {
    const request = new MockRequest("http://localhost:3000/api/newsletter", {
      method: "POST",
      body: "invalid json",
      headers: { "Content-Type": "application/json" },
    }) as unknown as Request;

    // Mock json() to throw
    request.json = jest.fn().mockRejectedValue(new Error("Invalid JSON"));

    const response = await POST(request);
    const data = await response.json();

    // Invalid JSON is a client error (400), not a server error
    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid JSON");
  });
});

