import { z } from "zod";

/**
 * Common validation schemas and utilities
 */

export const emailSchema = z.string().email("Invalid email address");

export const urlSchema = z.string().url("Invalid URL").or(z.literal(""));

export const idSchema = z.string().min(1, "ID is required");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const dateSchema = z.string().datetime().or(z.date());

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ""); // Remove potential HTML tags
}

/**
 * Validate and sanitize email
 */
export function validateEmail(email: unknown): string {
  return emailSchema.parse(email);
}

/**
 * Validate and sanitize URL
 */
export function validateUrl(url: unknown): string | null {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return null;
  }
  try {
    return urlSchema.parse(url.trim());
  } catch {
    return null;
  }
}

/**
 * Validate ID parameter
 */
export function validateId(id: unknown): string {
  return idSchema.parse(id);
}


