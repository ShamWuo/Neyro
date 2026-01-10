"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireAuth, validateAndSanitizeString } from "@/lib/security";
import { logger } from "@/lib/logger";

export async function createArea(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate and sanitize name
    const nameRaw = formData.get("name");
    const standardRaw = formData.get("standard");
    if (!nameRaw || !standardRaw) return;
    
    const name = validateAndSanitizeString(nameRaw, 500, "Name");
    const standard = validateAndSanitizeString(standardRaw, 2000, "Standard");
    
    await prisma.area.create({ data: { userId, name, standard } });
    redirect("/areas");
  } catch (error) {
    logger.error("Error creating area", error);
    redirect("/areas?error=create_failed");
  }
}

