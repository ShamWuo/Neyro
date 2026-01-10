import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function createUserWithPassword(
  email: string,
  password: string,
  name?: string
) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
        emailVerified: new Date(), // Auto-verify for credentials signup
      },
    });

    logger.info("User created with credentials", { email: user.email });
    return { user };
  } catch (error) {
    logger.error("Error creating user:", error instanceof Error ? error : new Error(String(error)));
    return { error: "Failed to create account" };
  }
}

