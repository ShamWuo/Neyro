/**
 * Security utilities and authorization helpers
 */

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { redirect } from "next/navigation";

/**
 * Verify user owns a resource before performing operations
 */
export async function verifyOwnership(resourceType: "item" | "project" | "area" | "resourceCollection" | "tag", resourceId: string, userId: string): Promise<boolean> {
  try {
    switch (resourceType) {
      case "item": {
        const item = await prisma.item.findUnique({ where: { id: resourceId, userId } });
        return !!item;
      }
      case "project": {
        const project = await prisma.project.findUnique({ where: { id: resourceId, userId } });
        return !!project;
      }
      case "area": {
        const area = await prisma.area.findUnique({ where: { id: resourceId, userId } });
        return !!area;
      }
      case "resourceCollection": {
        const collection = await prisma.resourceCollection.findUnique({ where: { id: resourceId, userId } });
        return !!collection;
      }
      case "tag": {
        const tag = await prisma.tag.findUnique({ where: { id: resourceId, userId } });
        return !!tag;
      }
      default:
        return false;
    }
  } catch (error) {
    logger.error(`Error verifying ownership for ${resourceType}:${resourceId}`, error);
    return false;
  }
}

/**
 * Verify user owns multiple resources
 */
export async function verifyBulkOwnership(resourceType: "item" | "project" | "area", resourceIds: string[], userId: string): Promise<boolean> {
  if (resourceIds.length === 0) return false;
  if (resourceIds.length > 100) return false; // Prevent resource exhaustion attacks

  try {
    switch (resourceType) {
      case "item": {
        const count = await prisma.item.count({ where: { id: { in: resourceIds }, userId } });
        return count === resourceIds.length;
      }
      case "project": {
        const count = await prisma.project.count({ where: { id: { in: resourceIds }, userId } });
        return count === resourceIds.length;
      }
      case "area": {
        const count = await prisma.area.count({ where: { id: { in: resourceIds }, userId } });
        return count === resourceIds.length;
      }
      default:
        return false;
    }
  } catch (error) {
    logger.error(`Error verifying bulk ownership for ${resourceType}`, error);
    return false;
  }
}

/**
 * Require authenticated user, redirect if not
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }
  return session;
}

/**
 * Get authenticated user or null
 */
export async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<iframe/gi, "<iframe disabled")
    .replace(/<object/gi, "<object disabled")
    .replace(/<embed/gi, "<embed disabled");
}

/**
 * Validate and sanitize string input with length limits
 */
export function validateAndSanitizeString(input: unknown, maxLength: number, fieldName: string): string {
  if (typeof input !== "string") {
    throw new Error(`Invalid ${fieldName}: must be a string`);
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }

  // Remove control characters except newlines and tabs
  const sanitized = trimmed.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");

  return sanitized;
}

/**
 * Validate email address
 */
export function validateEmail(email: unknown): string {
  if (typeof email !== "string") {
    throw new Error("Email must be a string");
  }

  const trimmed = email.trim().toLowerCase();
  if (trimmed.length === 0) {
    throw new Error("Email cannot be empty");
  }

  if (trimmed.length > 255) {
    throw new Error("Email exceeds maximum length");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    throw new Error("Invalid email format");
  }

  return trimmed;
}

/**
 * Validate URL with security checks
 */
export function validateUrlSafe(url: unknown): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.length > 2048) {
    return null; // URL too long
  }

  // Only allow http and https protocols
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
}

/**
 * Validate array of IDs
 */
export function validateIdArray(ids: unknown, maxLength: number = 100): string[] {
  if (!Array.isArray(ids)) {
    throw new Error("IDs must be an array");
  }

  if (ids.length === 0) {
    throw new Error("At least one ID is required");
  }

  if (ids.length > maxLength) {
    throw new Error(`Maximum ${maxLength} IDs allowed`);
  }

  return ids.map((id) => {
    if (typeof id !== "string") {
      throw new Error("All IDs must be strings");
    }
    if (id.length === 0 || id.length > 100) {
      throw new Error("Invalid ID format");
    }
    return id.trim();
  }).filter(Boolean);
}

/**
 * Rate limit check wrapper
 */
export async function withRateLimit<T>(
  key: string,
  fn: () => Promise<T>,
  rateLimitFn: (key: string) => void
): Promise<T> {
  try {
    rateLimitFn(key);
    return await fn();
  } catch (error) {
    if (error instanceof Error && error.message === "Too many requests") {
      throw error;
    }
    throw error;
  }
}

/**
 * Request timeout wrapper
 */
export async function withTimeout<T>(fn: Promise<T>, timeoutMs: number = 30000): Promise<T> {
  return Promise.race([
    fn,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    ),
  ]);
}
