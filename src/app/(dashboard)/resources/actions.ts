"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireAuth, validateAndSanitizeString } from "@/lib/security";
import { sanitizeString } from "@/lib/validation";
import { logger } from "@/lib/logger";

export async function createCollection(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate and sanitize name
    const nameRaw = formData.get("name");
    if (!nameRaw) return;
    const name = validateAndSanitizeString(nameRaw, 500, "Name");
    
    // Sanitize description
    const descriptionRaw = formData.get("description");
    const description = descriptionRaw ? sanitizeString(String(descriptionRaw), 2000) : null;
    
    await prisma.resourceCollection.create({ data: { userId, name, description } });
    redirect("/resources");
  } catch (error) {
    logger.error("Error creating collection", error);
    redirect("/resources?error=create_failed");
  }
}

