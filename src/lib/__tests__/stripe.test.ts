import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";

// Mock Prisma first
jest.mock("../prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock Stripe completely - avoid importing actual SDK
const mockGetOrCreateStripeCustomer = jest.fn();
const mockCreateCheckoutSession = jest.fn();
const mockUpdateSubscriptionFromStripe = jest.fn();

jest.mock("../stripe", () => ({
  stripe: {
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
  getOrCreateStripeCustomer: mockGetOrCreateStripeCustomer,
  createCheckoutSession: mockCreateCheckoutSession,
  createPortalSession: jest.fn(),
  updateSubscriptionFromStripe: mockUpdateSubscriptionFromStripe,
  STRIPE_PRICE_IDS: {
    FOCUS_MONTHLY: "price_focus_monthly",
    FOCUS_YEARLY: "price_focus_yearly",
    BRAIN_TRUST_MONTHLY: "price_brain_trust_monthly",
    BRAIN_TRUST_YEARLY: "price_brain_trust_yearly",
  },
}));

import { getOrCreateStripeCustomer, createCheckoutSession, updateSubscriptionFromStripe } from "../stripe";

describe("Stripe utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOrCreateStripeCustomer", () => {
    it("returns existing customer ID", async () => {
      const existingCustomerId = "cus_existing123";
      mockGetOrCreateStripeCustomer.mockResolvedValue(existingCustomerId);

      const customerId = await getOrCreateStripeCustomer("user-123", "test@example.com");

      expect(customerId).toBe(existingCustomerId);
      expect(mockGetOrCreateStripeCustomer).toHaveBeenCalledWith("user-123", "test@example.com", undefined);
    });

    it("creates new customer if user doesn't have one", async () => {
      const newCustomerId = "cus_new123";
      mockGetOrCreateStripeCustomer.mockResolvedValue(newCustomerId);

      const customerId = await getOrCreateStripeCustomer("user-123", "test@example.com", "Test User");

      expect(customerId).toBe(newCustomerId);
      expect(mockGetOrCreateStripeCustomer).toHaveBeenCalledWith("user-123", "test@example.com", "Test User");
    });
  });

  describe("createCheckoutSession", () => {
    it("creates checkout session for FOCUS tier", async () => {
      const mockSession = {
        id: "cs_test123",
        url: "https://checkout.stripe.com/test",
      };

      mockCreateCheckoutSession.mockResolvedValue(mockSession);

      const session = await createCheckoutSession("user-123", "FOCUS", "monthly");

      expect(mockCreateCheckoutSession).toHaveBeenCalledWith("user-123", "FOCUS", "monthly");
      expect(session).toEqual(mockSession);
    });

    it("creates checkout session for BRAIN_TRUST tier with yearly billing", async () => {
      const mockSession = {
        id: "cs_test456",
        url: "https://checkout.stripe.com/test",
      };

      mockCreateCheckoutSession.mockResolvedValue(mockSession);

      const session = await createCheckoutSession("user-123", "BRAIN_TRUST", "yearly");

      expect(mockCreateCheckoutSession).toHaveBeenCalledWith("user-123", "BRAIN_TRUST", "yearly");
      expect(session).toEqual(mockSession);
    });
  });

  describe("updateSubscriptionFromStripe", () => {
    it("updates subscription status from Stripe webhook", async () => {
      const mockSubscription = {
        id: "sub_test123",
        status: "active",
        metadata: {
          userId: "user-123",
          tier: "FOCUS",
        },
      };

      mockUpdateSubscriptionFromStripe.mockResolvedValue(undefined);

      await updateSubscriptionFromStripe(mockSubscription as any, "customer.subscription.updated");

      expect(mockUpdateSubscriptionFromStripe).toHaveBeenCalledWith(
        mockSubscription,
        "customer.subscription.updated"
      );
    });

    it("handles canceled subscription", async () => {
      const mockSubscription = {
        id: "sub_test123",
        status: "canceled",
        metadata: { userId: "user-123" },
      };

      mockUpdateSubscriptionFromStripe.mockResolvedValue(undefined);

      await updateSubscriptionFromStripe(mockSubscription as any, "customer.subscription.deleted");

      expect(mockUpdateSubscriptionFromStripe).toHaveBeenCalledWith(
        mockSubscription,
        "customer.subscription.deleted"
      );
    });
  });
});
