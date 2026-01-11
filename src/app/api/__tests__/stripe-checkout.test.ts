import { POST } from "../../api/stripe/create-checkout/route";
import { NextRequest } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import { auth } from "@/auth";

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/stripe", () => ({
  createCheckoutSession: jest.fn(),
}));

describe("Stripe Checkout API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createMockRequest = (body: any) => {
    return new NextRequest("http://localhost:3001/api/stripe/create-checkout", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  it("returns 401 if user is not authenticated", async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const request = createMockRequest({ tier: "FOCUS", billingCycle: "monthly" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("creates checkout session successfully", async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
    });

    const mockSession = {
      url: "https://checkout.stripe.com/test",
    };

    (createCheckoutSession as jest.Mock).mockResolvedValue(mockSession);

    const request = createMockRequest({ tier: "FOCUS", billingCycle: "monthly" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toBe("https://checkout.stripe.com/test");
    expect(createCheckoutSession).toHaveBeenCalledWith("user-123", "FOCUS", "monthly");
  });

  it("creates checkout session for BRAIN_TRUST tier", async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
    });

    const mockSession = {
      url: "https://checkout.stripe.com/test",
    };

    (createCheckoutSession as jest.Mock).mockResolvedValue(mockSession);

    const request = createMockRequest({ tier: "BRAIN_TRUST", billingCycle: "yearly" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(createCheckoutSession).toHaveBeenCalledWith("user-123", "BRAIN_TRUST", "yearly");
  });

  it("returns 400 for invalid tier", async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
    });

    const request = createMockRequest({ tier: "INVALID", billingCycle: "monthly" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("returns 400 for invalid billing cycle", async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
    });

    const request = createMockRequest({ tier: "FOCUS", billingCycle: "invalid" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("handles checkout session creation errors", async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
    });

    (createCheckoutSession as jest.Mock).mockRejectedValue(new Error("Stripe error"));

    const request = createMockRequest({ tier: "FOCUS", billingCycle: "monthly" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to create checkout session");
  });
});
