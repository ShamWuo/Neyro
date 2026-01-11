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

import { getOrCreateStripeCustomer, createCheckoutSession, updateSubscriptionFromStripe } from "../stripe";
const stripeModule = require("../stripe");

describe("Stripe utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure prisma user.findUnique returns a user with email for createCheckoutSession
    const { prisma } = require("../prisma");
    if (prisma && prisma.user && prisma.user.findUnique) {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ email: "test@example.com", name: "Test User", stripeCustomerId: null });
    }
    // Ensure stripe package mocks from jest.setup are initialized
    if (stripeModule && stripeModule.stripe) {
      // default implementations for stripe client methods used in tests
      stripeModule.stripe.customers = stripeModule.stripe.customers || {};
      stripeModule.stripe.customers.create = jest.fn().mockResolvedValue({ id: "cus_test123" });
      stripeModule.stripe.checkout = stripeModule.stripe.checkout || { sessions: { create: jest.fn().mockResolvedValue({ id: "cs_test", url: "https://checkout.test" }) } };
      stripeModule.stripe.checkout.sessions.create = jest.fn().mockResolvedValue({ id: "cs_test", url: "https://checkout.test" });
      stripeModule.stripe.billingPortal = stripeModule.stripe.billingPortal || { sessions: { create: jest.fn().mockResolvedValue({ url: "https://portal.test" }) } };
      stripeModule.stripe.billingPortal.sessions.create = jest.fn().mockResolvedValue({ url: "https://portal.test" });
    }
  });

  describe("getOrCreateStripeCustomer", () => {
    it("returns existing customer ID", async () => {
      const existingCustomerId = "cus_existing123";
      const { prisma } = require("../prisma");
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ stripeCustomerId: existingCustomerId });

      const customerId = await getOrCreateStripeCustomer("user-123", "test@example.com");

      expect(customerId).toBe(existingCustomerId);
    });

    it("creates new customer if user doesn't have one", async () => {
      const newCustomerId = "cus_new123";
      const { prisma } = require("../prisma");
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const stripeModule = require("../stripe");
      stripeModule.stripe.customers.create = jest.fn().mockResolvedValue({ id: newCustomerId });

      const customerId = await getOrCreateStripeCustomer("user-123", "test@example.com", "Test User");

      expect(customerId).toBe(newCustomerId);
      const { prisma: p } = require("../prisma");
      expect(p.user.update).toHaveBeenCalledWith({ where: { id: "user-123" }, data: { stripeCustomerId: newCustomerId } });
    });
  });

  describe("createCheckoutSession", () => {
    it("creates checkout session for FOCUS tier", async () => {
      const mockSession = {
        id: "cs_test123",
        url: "https://checkout.stripe.com/test",
      };

      const stripeModule = require("../stripe");
      stripeModule.stripe.checkout.sessions.create = jest.fn().mockResolvedValue(mockSession);

      const session = await createCheckoutSession("user-123", "FOCUS", "monthly");

      expect(stripeModule.stripe.checkout.sessions.create).toHaveBeenCalled();
      expect(session).toEqual(mockSession);
    });

    it("creates checkout session for BRAIN_TRUST tier with yearly billing", async () => {
      const mockSession = {
        id: "cs_test456",
        url: "https://checkout.stripe.com/test",
      };

      const stripeModule = require("../stripe");
      stripeModule.stripe.checkout.sessions.create = jest.fn().mockResolvedValue(mockSession);

      const session = await createCheckoutSession("user-123", "BRAIN_TRUST", "yearly");

      expect(stripeModule.stripe.checkout.sessions.create).toHaveBeenCalled();
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
      const { prisma } = require("../prisma");
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateSubscriptionFromStripe(mockSubscription as any, "customer.subscription.updated");

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: expect.objectContaining({
          subscriptionTier: "FOCUS",
          subscriptionStatus: expect.any(String),
          stripeSubscriptionId: "sub_test123",
        }),
      });
    });

    it("handles canceled subscription", async () => {
      const mockSubscription = {
        id: "sub_test123",
        status: "canceled",
        metadata: { userId: "user-123" },
      };
      const { prisma } = require("../prisma");
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateSubscriptionFromStripe(mockSubscription as any, "customer.subscription.deleted");

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: expect.objectContaining({
          subscriptionStatus: expect.any(String),
          stripeSubscriptionId: "sub_test123",
        }),
      });
    });
  });
});
