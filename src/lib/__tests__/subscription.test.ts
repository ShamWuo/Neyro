import { getUserSubscription, checkSubscriptionLimit, canAccessFeature, startTrial } from "../subscription";
import { prisma } from "../prisma";
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";

jest.mock("../prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    project: {
      count: jest.fn(),
    },
  },
}));

describe("Subscription utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserSubscription", () => {
    it("returns subscription info for active user", async () => {
      const mockUser = {
        subscriptionTier: SubscriptionTier.FOCUS,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionCurrentPeriodEnd: new Date("2025-02-01"),
        subscriptionCancelAtPeriodEnd: false,
        trialEndsAt: null,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const subscription = await getUserSubscription("user-123");

      expect(subscription).toEqual({
        tier: SubscriptionTier.FOCUS,
        status: SubscriptionStatus.ACTIVE,
        isActive: true,
        isTrial: false,
        currentPeriodEnd: new Date("2025-02-01"),
        cancelAtPeriodEnd: false,
        trialEndsAt: null,
        limits: expect.objectContaining({
          maxProjects: 7,
          maxAiCredits: -1,
          exports: true,
          templates: true,
        }),
      });
    });

    it("returns null for non-existent user", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const subscription = await getUserSubscription("non-existent");

      expect(subscription).toBeNull();
    });

    it("detects trial status correctly", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const mockUser = {
        subscriptionTier: SubscriptionTier.FOCUS,
        subscriptionStatus: SubscriptionStatus.TRIALING,
        subscriptionCurrentPeriodEnd: null,
        subscriptionCancelAtPeriodEnd: false,
        trialEndsAt: futureDate,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const subscription = await getUserSubscription("user-123");

      expect(subscription?.isTrial).toBe(true);
      expect(subscription?.isActive).toBe(true);
    });

    it("returns correct limits for FREE tier", async () => {
      const mockUser = {
        subscriptionTier: SubscriptionTier.FREE,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionCurrentPeriodEnd: null,
        subscriptionCancelAtPeriodEnd: false,
        trialEndsAt: null,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const subscription = await getUserSubscription("user-123");

      expect(subscription?.limits.maxProjects).toBe(3);
      expect(subscription?.limits.maxAiCredits).toBe(50);
      expect(subscription?.limits.exports).toBe(false);
    });
  });

  describe("checkSubscriptionLimit", () => {
    it("allows project creation when under limit", async () => {
      const mockUser = {
        subscriptionTier: SubscriptionTier.FOCUS,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionCurrentPeriodEnd: null,
        subscriptionCancelAtPeriodEnd: false,
        trialEndsAt: null,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.project.count as jest.Mock).mockResolvedValue(3);

      const result = await checkSubscriptionLimit("user-123", "maxProjects");

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(7);
      expect(result.current).toBe(3);
    });

    it("blocks project creation when at limit", async () => {
      const mockUser = {
        subscriptionTier: SubscriptionTier.FREE,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionCurrentPeriodEnd: null,
        subscriptionCancelAtPeriodEnd: false,
        trialEndsAt: null,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.project.count as jest.Mock).mockResolvedValue(3);

      const result = await checkSubscriptionLimit("user-123", "maxProjects");

      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(3);
      expect(result.current).toBe(3);
    });

    it("returns unlimited for AI credits on paid plans", async () => {
      const mockUser = {
        subscriptionTier: SubscriptionTier.FOCUS,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionCurrentPeriodEnd: null,
        subscriptionCancelAtPeriodEnd: false,
        trialEndsAt: null,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await checkSubscriptionLimit("user-123", "maxAiCredits");

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(-1); // -1 means unlimited
    });
  });

  describe("canAccessFeature", () => {
    it("returns true for paid users accessing exports", async () => {
      const mockUser = {
        subscriptionTier: SubscriptionTier.FOCUS,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionCurrentPeriodEnd: null,
        subscriptionCancelAtPeriodEnd: false,
        trialEndsAt: null,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const hasAccess = await canAccessFeature("user-123", "exports");

      expect(hasAccess).toBe(true);
    });

    it("returns false for free users accessing exports", async () => {
      const mockUser = {
        subscriptionTier: SubscriptionTier.FREE,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionCurrentPeriodEnd: null,
        subscriptionCancelAtPeriodEnd: false,
        trialEndsAt: null,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const hasAccess = await canAccessFeature("user-123", "exports");

      expect(hasAccess).toBe(false);
    });

    it("returns false for inactive subscriptions", async () => {
      const mockUser = {
        subscriptionTier: SubscriptionTier.FOCUS,
        subscriptionStatus: SubscriptionStatus.CANCELED,
        subscriptionCurrentPeriodEnd: null,
        subscriptionCancelAtPeriodEnd: false,
        trialEndsAt: null,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const hasAccess = await canAccessFeature("user-123", "exports");

      expect(hasAccess).toBe(false);
    });
  });

  describe("startTrial", () => {
    it("starts 14-day trial for FOCUS tier", async () => {
      const mockTrialEndsAt = new Date();
      mockTrialEndsAt.setDate(mockTrialEndsAt.getDate() + 14);

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: "user-123",
        subscriptionTier: SubscriptionTier.FOCUS,
        subscriptionStatus: SubscriptionStatus.TRIALING,
        trialEndsAt: mockTrialEndsAt,
      });

      const trialEndsAt = await startTrial("user-123", SubscriptionTier.FOCUS);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: expect.objectContaining({
          subscriptionTier: SubscriptionTier.FOCUS,
          subscriptionStatus: SubscriptionStatus.TRIALING,
          trialEndsAt: expect.any(Date),
        }),
      });

      expect(trialEndsAt).toBeInstanceOf(Date);
      const daysDiff = Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(14);
    });
  });
});
