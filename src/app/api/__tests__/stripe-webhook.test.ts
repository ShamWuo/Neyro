import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";

// Mock Prisma first
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      update: jest.fn(),
    },
  },
}));

// Mock Stripe completely - avoid importing actual SDK
const mockConstructEvent = jest.fn();
const mockRetrieveSubscription = jest.fn();
const mockUpdateSubscriptionFromStripe = jest.fn();

// Use doMock to avoid Jest hoisting the factory before our mock declarations
jest.doMock("@/lib/stripe", () => ({
  // Export `stripe` as an object matching runtime shape
  stripe: {
    webhooks: {
      constructEvent: mockConstructEvent,
    },
    subscriptions: {
      retrieve: mockRetrieveSubscription,
    },
  },
  updateSubscriptionFromStripe: mockUpdateSubscriptionFromStripe,
  STRIPE_PRICE_IDS: {},
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(() => ({
    get: jest.fn((name: string) => {
      if (name === "stripe-signature") return "test-signature";
      return null;
    }),
  })),
}));

// Import after mocks
import { POST } from "../../api/stripe/webhook/route";
import { prisma } from "@/lib/prisma";
import { updateSubscriptionFromStripe } from "@/lib/stripe";

describe("Stripe Webhook Handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
    // Ensure the mocked stripe module shape is used
    const stripeModule = require("@/lib/stripe");
    if (stripeModule && stripeModule.stripe) {
      stripeModule.stripe.webhooks = { constructEvent: mockConstructEvent };
      stripeModule.stripe.subscriptions = { retrieve: mockRetrieveSubscription };
    }
  });

  const createMockRequest = (body: string) => {
    return {
      text: async () => body,
      url: "http://localhost:3001/api/stripe/webhook",
      method: "POST",
      headers: new Map([["stripe-signature", "test-signature"]]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  };

  it("handles checkout.session.completed event", async () => {
    const mockEvent = {
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: {
            userId: "user-123",
            tier: "FOCUS",
          },
        },
      },
    };

    mockConstructEvent.mockReturnValue(mockEvent);
    (prisma.user.update as jest.Mock).mockResolvedValue({
      id: "user-123",
      subscriptionTier: SubscriptionTier.FOCUS,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
    });

    const request = createMockRequest(JSON.stringify(mockEvent));
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: {
        subscriptionTier: SubscriptionTier.FOCUS,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      },
    });
  });

  it("handles customer.subscription.updated event", async () => {
    const mockEvent = {
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_test123",
          status: "active",
          metadata: { userId: "user-123", tier: "FOCUS" },
        },
      },
    };

    mockConstructEvent.mockReturnValue(mockEvent);
    (mockUpdateSubscriptionFromStripe as jest.Mock).mockResolvedValue(undefined);

    const request = createMockRequest(JSON.stringify(mockEvent));
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(mockUpdateSubscriptionFromStripe).toHaveBeenCalledWith(
      mockEvent.data.object,
      "customer.subscription.updated"
    );
  });

  it("handles customer.subscription.deleted event", async () => {
    const mockEvent = {
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_test123",
          metadata: { userId: "user-123" },
        },
      },
    };

    mockConstructEvent.mockReturnValue(mockEvent);
    (prisma.user.update as jest.Mock).mockResolvedValue({
      id: "user-123",
      subscriptionTier: SubscriptionTier.FREE,
      subscriptionStatus: SubscriptionStatus.CANCELED,
    });

    const request = createMockRequest(JSON.stringify(mockEvent));
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: {
        subscriptionTier: SubscriptionTier.FREE,
        subscriptionStatus: SubscriptionStatus.CANCELED,
        stripeSubscriptionId: null,
      },
    });
  });

  it("handles invoice.payment_succeeded event", async () => {
    const mockSubscription = {
      id: "sub_test123",
      status: "active",
      metadata: { userId: "user-123", tier: "FOCUS" },
    };

    const mockEvent = {
      type: "invoice.payment_succeeded",
      data: {
        object: {
          id: "in_test123",
          subscription: "sub_test123",
        },
      },
    };

    mockConstructEvent.mockReturnValue(mockEvent);
    mockRetrieveSubscription.mockResolvedValue(mockSubscription);
    (mockUpdateSubscriptionFromStripe as jest.Mock).mockResolvedValue(undefined);

    const request = createMockRequest(JSON.stringify(mockEvent));
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(mockRetrieveSubscription).toHaveBeenCalledWith("sub_test123");
    expect(mockUpdateSubscriptionFromStripe).toHaveBeenCalledWith(mockSubscription, "invoice.payment_succeeded");
  });

  it("returns 400 for invalid signature", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const request = createMockRequest("test body");
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid signature");
  });
});
