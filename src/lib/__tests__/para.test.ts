import { ensureProjectLimit, getActiveProjectCount, checkSubscriptionLimit } from "../para";
import { prisma } from "../prisma";
import { ProjectStatus } from "@prisma/client";

jest.mock("../prisma", () => ({
  prisma: {
    project: {
      count: jest.fn(),
    },
  },
}));

jest.mock("../subscription", () => ({
  checkSubscriptionLimit: jest.fn(),
}));

describe("PARA utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getActiveProjectCount", () => {
    it("returns count of active projects", async () => {
      (prisma.project.count as jest.Mock).mockResolvedValue(5);

      const { getActiveProjectCount } = await import("../para");
      const count = await getActiveProjectCount("user-123");

      expect(count).toBe(5);
      expect(prisma.project.count).toHaveBeenCalledWith({
        where: {
          userId: "user-123",
          status: ProjectStatus.ACTIVE,
          archivedAt: null,
        },
      });
    });
  });

  describe("ensureProjectLimit", () => {
    it("throws error when at free tier limit", async () => {
      const { checkSubscriptionLimit } = await import("../subscription");
      (checkSubscriptionLimit as jest.Mock).mockResolvedValue({
        allowed: false,
        limit: 3,
        current: 3,
      });

      const { ensureProjectLimit } = await import("../para");

      await expect(ensureProjectLimit("user-123")).rejects.toThrow(
        /free tier limit of 3 active projects/
      );
    });

    it("throws error when at paid tier limit", async () => {
      const { checkSubscriptionLimit } = await import("../subscription");
      (checkSubscriptionLimit as jest.Mock).mockResolvedValue({
        allowed: false,
        limit: 7,
        current: 7,
      });

      const { ensureProjectLimit } = await import("../para");

      await expect(ensureProjectLimit("user-123")).rejects.toThrow(
        /7 active projects limit/
      );
    });

    it("does not throw when under limit", async () => {
      const { checkSubscriptionLimit } = await import("../subscription");
      (checkSubscriptionLimit as jest.Mock).mockResolvedValue({
        allowed: true,
        limit: 7,
        current: 3,
      });

      const { ensureProjectLimit } = await import("../para");

      await expect(ensureProjectLimit("user-123")).resolves.not.toThrow();
    });
  });
});
