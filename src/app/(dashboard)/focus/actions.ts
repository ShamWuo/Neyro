"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireAuth, verifyOwnership, validateAndSanitizeString } from "@/lib/security";
import { validateId } from "@/lib/validation";
import { logger } from "@/lib/logger";

function startOfToday() {
  const iso = new Date().toISOString().slice(0, 10);
  return new Date(iso);
}

export async function setDailyProject(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    const projectIdRaw = formData.get("projectId");
    let projectId: string | null = null;
    
    if (projectIdRaw) {
      projectId = String(projectIdRaw).trim();
      if (projectId) {
        validateId(projectId);
        // Verify ownership of project
        const ownsProject = await verifyOwnership("project", projectId, userId);
        if (!ownsProject) {
          logger.warn(`User ${userId} attempted to set daily project ${projectId} without ownership`);
          redirect("/focus?error=unauthorized");
        }
      }
    }
    
    await prisma.dailyFocus.upsert({
      where: { userId_date: { userId, date: startOfToday() } },
      update: { projectId },
      create: { userId, date: startOfToday(), projectId },
    });
    redirect("/focus");
  } catch (error) {
    logger.error("Error setting daily project", error);
    redirect("/focus?error=set_failed");
  }
}

export async function pinItem(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    const itemIdRaw = formData.get("itemId");
    if (!itemIdRaw) return;
    const itemId = String(itemIdRaw).trim();
    validateId(itemId);
    
    // Verify ownership of item
    const ownsItem = await verifyOwnership("item", itemId, userId);
    if (!ownsItem) {
      logger.warn(`User ${userId} attempted to pin item ${itemId} without ownership`);
      redirect("/focus?error=unauthorized");
    }
    
    await prisma.focusPin.upsert({ where: { userId_itemId_date: { userId, itemId, date: startOfToday() } }, update: {}, create: { userId, itemId, date: startOfToday() } });
    redirect("/focus");
  } catch (error) {
    logger.error("Error pinning item", error);
    redirect("/focus?error=pin_failed");
  }
}

export async function unpin(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    const itemIdRaw = formData.get("itemId");
    if (!itemIdRaw) return;
    const itemId = String(itemIdRaw).trim();
    validateId(itemId);
    
    // Verify ownership of item (user can only unpin their own items)
    const ownsItem = await verifyOwnership("item", itemId, userId);
    if (!ownsItem) {
      logger.warn(`User ${userId} attempted to unpin item ${itemId} without ownership`);
      redirect("/focus?error=unauthorized");
    }
    
    await prisma.focusPin.deleteMany({ where: { userId, itemId, date: { gte: startOfToday() } } });
    redirect("/focus");
  } catch (error) {
    logger.error("Error unpinning item", error);
    redirect("/focus?error=unpin_failed");
  }
}

export async function addSession(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate and sanitize label
    const labelRaw = formData.get("label");
    if (!labelRaw) return;
    const label = validateAndSanitizeString(labelRaw, 200, "Label");
    
    // Validate minutes
    const minutesRaw = formData.get("minutes");
    if (!minutesRaw) return;
    const minutes = Number(minutesRaw);
    
    // Validate minutes is a positive number within reasonable limits
    if (Number.isNaN(minutes) || minutes <= 0 || minutes > 1440) { // Max 24 hours
      redirect("/focus?error=invalid_minutes");
    }
    
    await prisma.focusSession.create({ data: { userId, label, minutes: Math.floor(minutes), date: startOfToday() } });
    redirect("/focus");
  } catch (error) {
    logger.error("Error adding session", error);
    redirect("/focus?error=add_session_failed");
  }
}

