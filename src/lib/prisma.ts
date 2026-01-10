import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Test database connection on startup (only in Node.js runtime, not Edge)
// This check is skipped in Edge runtime to avoid Prisma Client validation errors
// EdgeRuntime is a global that exists only in Edge runtime environments
type GlobalEdgeRuntime = {
  EdgeRuntime?: unknown;
};
const globalEdgeRuntime = globalThis as unknown as GlobalEdgeRuntime;
if (typeof window === "undefined" && !globalEdgeRuntime.EdgeRuntime) {
  prisma.$connect().catch((error) => {
    logger.error("Failed to connect to database", error);
    if (process.env.NODE_ENV === "development") {
      // Additional helpful message in development
      logger.warn("Check your DATABASE_URL in .env file");
    }
  });
}
