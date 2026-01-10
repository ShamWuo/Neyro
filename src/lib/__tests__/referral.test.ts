import { generateReferralCode, trackReferral, markReferralConverted } from "../referral";
import { prisma } from "../prisma";

jest.mock("../prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    referral: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("Referral utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateReferralCode", () => {
    it("returns existing referral code if user has one", async () => {
      const existingCode = "EXISTING123";
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        referralCode: existingCode,
      });

      const code = await generateReferralCode("user-123");

      expect(code).toBe(existingCode);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("generates new referral code if user doesn't have one", async () => {
      const newCode = "NEWCODE123";
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ referralCode: null })
        .mockResolvedValueOnce(null); // Code doesn't exist
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: "user-123",
        referralCode: newCode,
      });

      // Mock Math.random to return predictable code
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.123456); // Will generate consistent code

      const code = await generateReferralCode("user-123");

      expect(code).toBeTruthy();
      expect(code.length).toBeGreaterThan(0);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { referralCode: expect.any(String) },
      });

      Math.random = originalRandom;
    });
  });

  describe("trackReferral", () => {
    it("creates new referral record", async () => {
      const mockReferral = {
        id: "ref-123",
        referrerId: "user-123",
        referredEmail: "newuser@example.com",
        status: "pending",
      };

      (prisma.referral.upsert as jest.Mock).mockResolvedValue(mockReferral);

      const referral = await trackReferral("user-123", "newuser@example.com");

      expect(prisma.referral.upsert).toHaveBeenCalledWith({
        where: {
          referrerId_referredEmail: {
            referrerId: "user-123",
            referredEmail: "newuser@example.com",
          },
        },
        create: {
          referrerId: "user-123",
          referredEmail: "newuser@example.com",
          status: "pending",
        },
        update: {},
      });
    });
  });

  describe("markReferralConverted", () => {
    it("marks referral as converted and increments count", async () => {
      const mockReferral = {
        id: "ref-123",
        referrerId: "user-123",
        referredEmail: "newuser@example.com",
        status: "pending",
      };

      (prisma.referral.findFirst as jest.Mock).mockResolvedValue(mockReferral);
      (prisma.referral.update as jest.Mock).mockResolvedValue({
        ...mockReferral,
        status: "converted",
        convertedAt: new Date(),
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: "user-123",
        referralCount: 1,
      });

      await markReferralConverted("newuser@example.com");

      expect(prisma.referral.findFirst).toHaveBeenCalledWith({
        where: { referredEmail: "newuser@example.com", status: "pending" },
      });

      expect(prisma.referral.update).toHaveBeenCalledWith({
        where: { id: "ref-123" },
        data: {
          status: "converted",
          convertedAt: expect.any(Date),
        },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { referralCount: { increment: 1 } },
      });
    });

    it("does nothing if referral not found", async () => {
      (prisma.referral.findFirst as jest.Mock).mockResolvedValue(null);

      await markReferralConverted("nonexistent@example.com");

      expect(prisma.referral.update).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
