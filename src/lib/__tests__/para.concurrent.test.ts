import { prisma } from "../prisma";

jest.mock("../prisma", () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

jest.mock("../subscription", () => ({
  checkSubscriptionLimit: jest.fn(),
}));

describe("createProjectWithLimit concurrency simulation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows only one create when limit is 1 under concurrent requests", async () => {
    const { checkSubscriptionLimit } = await import("../subscription");
    (checkSubscriptionLimit as jest.Mock).mockResolvedValue({ allowed: true, limit: 1, current: 0 });

    // Shared in-memory counter to simulate DB state
    let counter = 0;

    // Simple async mutex to serialize transaction callbacks (simulate DB transaction atomicity)
    let lock = Promise.resolve();
    function acquire(): Promise<() => void> {
      let release: () => void;
      const p = new Promise<void>((res) => (release = res));
      const ticket = lock;
      // chain the lock so each acquire waits for previous release before proceeding
      lock = (async () => {
        await ticket;
        await p;
      })();
      // return a promise that resolves to the release function when it's this caller's turn
      return ticket.then(() => release!);
    }

    // Mock $transaction to run the provided callback with a tx that reads/updates counter
    (prisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      const release = await acquire();
      try {
        const tx = {
          project: {
            count: jest.fn().mockImplementation(async () => counter),
            create: jest.fn().mockImplementation(async ({ data }: any) => {
              // Simulate create by incrementing counter and returning created object
              counter += 1;
              return { id: `proj-${counter}`, ...data };
            }),
          },
        } as any;
        // run callback
        const res = await cb(tx);
        return res;
      } finally {
        release();
      }
    });

    const { createProjectWithLimit } = await import("../para");

    const p1 = createProjectWithLimit("user-1", { name: "One" } as any);
    const p2 = createProjectWithLimit("user-1", { name: "Two" } as any);

    const results = await Promise.allSettled([p1, p2]);
    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    if ((fulfilled[0] as PromiseFulfilledResult<any>).value) {
      expect((fulfilled[0] as PromiseFulfilledResult<any>).value.id).toBeDefined();
    }
  });
});
