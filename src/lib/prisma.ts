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

// Test database connection on startup
if (typeof window === "undefined") {
  prisma.$connect().catch((error) => {
    logger.error("Failed to connect to database", error);
    if (process.env.NODE_ENV === "development") {
      // Additional helpful message in development
      logger.warn("Check your DATABASE_URL in .env file");
    }
  });
}
