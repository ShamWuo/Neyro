import { prisma } from "../prisma";

jest.mock("../prisma", () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

jest.mock("../subscription", () => ({
  checkSubscriptionLimit: jest.fn(),
}));

describe("createProjectWithLimit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a project when under limit", async () => {
    const { checkSubscriptionLimit } = await import("../subscription");
    (checkSubscriptionLimit as jest.Mock).mockResolvedValue({ allowed: true, limit: 7, current: 3 });

    const fakeCreated = { id: "proj-1", name: "Test" };

    // Mock transaction to call the callback with a tx that has project.count and project.create
    (prisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      const tx = {
        project: {
          count: jest.fn().mockResolvedValue(3),
          create: jest.fn().mockResolvedValue(fakeCreated),
        },
      };
      return cb(tx);
    });

    const { createProjectWithLimit } = await import("../para");
    const result = await createProjectWithLimit("user-1", { name: "Test" } as any);
    expect(result).toEqual(fakeCreated);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("throws when limit reached inside transaction", async () => {
    const { checkSubscriptionLimit } = await import("../subscription");
    (checkSubscriptionLimit as jest.Mock).mockResolvedValue({ allowed: true, limit: 7, current: 7 });

    (prisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      const tx = {
        project: {
          count: jest.fn().mockResolvedValue(7),
        },
      };
      return cb(tx);
    });

    const { createProjectWithLimit } = await import("../para");
    await expect(createProjectWithLimit("user-1", { name: "X" } as any)).rejects.toThrow(/active projects limit/);
  });
});
