"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { touchArea } from "@/lib/para";
import { ItemClassification, ItemType } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAuth, verifyOwnership, validateAndSanitizeString, validateEmail } from "@/lib/security";
import { sanitizeString, validateUrl, validateId } from "@/lib/validation";
import { logger } from "@/lib/logger";

export async function addShare(areaId: string, formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate area ID
    validateId(areaId);
    
    // Verify ownership
    const ownsArea = await verifyOwnership("area", areaId, userId);
    if (!ownsArea) {
      logger.warn(`User ${userId} attempted to share area ${areaId} without ownership`);
      redirect(`/areas/${areaId}?error=unauthorized`);
    }

    // Validate and sanitize email
    const emailRaw = formData.get("email");
    if (!emailRaw) return;
    const email = validateEmail(emailRaw);
    
    await prisma.shareAccess.create({ data: { ownerId: userId, areaId, email, permission: "VIEW" } });
    redirect(`/areas/${areaId}`);
  } catch (error) {
    logger.error("Error adding share", error);
    redirect(`/areas/${areaId}?error=share_failed`);
  }
}

export async function updateArea(areaId: string, formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate area ID
    validateId(areaId);
    
    // Verify ownership
    const ownsArea = await verifyOwnership("area", areaId, userId);
    if (!ownsArea) {
      logger.warn(`User ${userId} attempted to update area ${areaId} without ownership`);
      redirect(`/areas/${areaId}?error=unauthorized`);
    }

    // Validate and sanitize inputs
    const nameRaw = formData.get("name");
    const standardRaw = formData.get("standard");
    if (!nameRaw || !standardRaw) return;
    
    const name = validateAndSanitizeString(nameRaw, 500, "Name");
    const standard = validateAndSanitizeString(standardRaw, 2000, "Standard");
    
    await prisma.area.update({ where: { id: areaId, userId }, data: { name, standard } });
    await touchArea(userId, areaId);
    redirect(`/areas/${areaId}`);
  } catch (error) {
    logger.error("Error updating area", error);
    redirect(`/areas/${areaId}?error=update_failed`);
  }
}

export async function updateReview(areaId: string, formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate area ID
    validateId(areaId);
    
    // Verify ownership
    const ownsArea = await verifyOwnership("area", areaId, userId);
    if (!ownsArea) {
      logger.warn(`User ${userId} attempted to update review for area ${areaId} without ownership`);
      redirect(`/areas/${areaId}?error=unauthorized`);
    }

    // Validate score
    const scoreRaw = formData.get("score");
    if (!scoreRaw) return;
    const score = Number(scoreRaw);
    
    // Validate score is within valid range (1-5)
    if (isNaN(score) || score < 1 || score > 5) {
      redirect(`/areas/${areaId}?error=invalid_score`);
    }
    
    // Validate date
    const dateRaw = formData.get("date");
    let reviewDate: Date;
    if (dateRaw) {
      try {
        reviewDate = new Date(String(dateRaw));
        if (isNaN(reviewDate.getTime())) {
          reviewDate = new Date();
        }
      } catch {
        reviewDate = new Date();
      }
    } else {
      reviewDate = new Date();
    }
    
    await prisma.area.update({
      where: { id: areaId, userId },
      data: { lastHealthScore: score, lastReviewDate: reviewDate },
    });
    await touchArea(userId, areaId);
    redirect(`/areas/${areaId}`);
  } catch (error) {
    logger.error("Error updating review", error);
    redirect(`/areas/${areaId}?error=review_failed`);
  }
}

export async function addItem(areaId: string, formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate area ID
    validateId(areaId);
    
    // Verify ownership
    const ownsArea = await verifyOwnership("area", areaId, userId);
    if (!ownsArea) {
      logger.warn(`User ${userId} attempted to add item to area ${areaId} without ownership`);
      redirect(`/areas/${areaId}?error=unauthorized`);
    }

    // Validate and sanitize title
    const titleRaw = formData.get("title");
    if (!titleRaw) return;
    const title = validateAndSanitizeString(titleRaw, 500, "Title");
    
    // Sanitize details
    const detailsRaw = formData.get("details");
    const details = detailsRaw ? sanitizeString(String(detailsRaw), 10000) : null;
    
    // Validate URL
    const urlRaw = formData.get("url");
    const url = urlRaw ? validateUrl(urlRaw) : null;
    
    // Validate type
    const typeRaw = formData.get("type");
    let type: ItemType = ItemType.NOTE;
    if (typeRaw && Object.values(ItemType).includes(typeRaw as ItemType)) {
      type = typeRaw as ItemType;
    }
    
    await prisma.item.create({
      data: {
        userId,
        title,
        details,
        url,
        type,
        classification: ItemClassification.AREA,
        areaId,
      },
    });
    await touchArea(userId, areaId);
    redirect(`/areas/${areaId}`);
  } catch (error) {
    logger.error("Error adding item", error);
    redirect(`/areas/${areaId}?error=add_item_failed`);
  }
}

export async function updateItem(areaId: string, formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate area ID
    validateId(areaId);
    
    // Verify ownership of area
    const ownsArea = await verifyOwnership("area", areaId, userId);
    if (!ownsArea) {
      logger.warn(`User ${userId} attempted to update item in area ${areaId} without ownership`);
      redirect(`/areas/${areaId}?error=unauthorized`);
    }

    // Validate item ID
    const itemIdRaw = formData.get("itemId");
    if (!itemIdRaw) return;
    const itemId = String(itemIdRaw).trim();
    validateId(itemId);
    
    // Verify ownership of item
    const ownsItem = await verifyOwnership("item", itemId, userId);
    if (!ownsItem) {
      logger.warn(`User ${userId} attempted to update item ${itemId} without ownership`);
      redirect(`/areas/${areaId}?error=unauthorized`);
    }

    // Validate and sanitize title
    const titleRaw = formData.get("title");
    if (!titleRaw) return;
    const title = validateAndSanitizeString(titleRaw, 500, "Title");
    
    // Sanitize details
    const detailsRaw = formData.get("details");
    const details = detailsRaw ? sanitizeString(String(detailsRaw), 10000) : null;
    
    // Validate URL
    const urlRaw = formData.get("url");
    const url = urlRaw ? validateUrl(urlRaw) : null;
    
    // Validate type
    const typeRaw = formData.get("type");
    let type: ItemType = ItemType.NOTE;
    if (typeRaw && Object.values(ItemType).includes(typeRaw as ItemType)) {
      type = typeRaw as ItemType;
    }
    
    await prisma.item.update({ where: { id: itemId, userId }, data: { title, details, url, type } });
    await touchArea(userId, areaId);
    redirect(`/areas/${areaId}`);
  } catch (error) {
    logger.error("Error updating item", error);
    redirect(`/areas/${areaId}?error=update_item_failed`);
  }
}

export async function moveItem(areaId: string, formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate area ID
    validateId(areaId);
    
    // Verify ownership of area
    const ownsArea = await verifyOwnership("area", areaId, userId);
    if (!ownsArea) {
      logger.warn(`User ${userId} attempted to move item in area ${areaId} without ownership`);
      redirect(`/areas/${areaId}?error=unauthorized`);
    }

    // Validate item ID
    const itemIdRaw = formData.get("itemId");
    if (!itemIdRaw) return;
    const itemId = String(itemIdRaw).trim();
    validateId(itemId);
    
    // Verify ownership of item
    const ownsItem = await verifyOwnership("item", itemId, userId);
    if (!ownsItem) {
      logger.warn(`User ${userId} attempted to move item ${itemId} without ownership`);
      redirect(`/areas/${areaId}?error=unauthorized`);
    }

    const target = String(formData.get("target") ?? "");
    
    // Validate target is a valid classification
    const validTargets = ["inbox", "project", "resource", "archive"];
    if (!validTargets.includes(target)) {
      redirect(`/areas/${areaId}?error=invalid_target`);
    }
    
    const projectIdRaw = formData.get("projectId");
    const collectionIdRaw = formData.get("collectionId");
    
    let projectId: string | null = null;
    let collectionId: string | null = null;
    
    if (projectIdRaw && target === "project") {
      projectId = String(projectIdRaw).trim();
      if (projectId) {
        validateId(projectId);
        const ownsProject = await verifyOwnership("project", projectId, userId);
        if (!ownsProject) {
          redirect(`/areas/${areaId}?error=unauthorized`);
        }
      }
    }
    
    if (collectionIdRaw && target === "resource") {
      collectionId = String(collectionIdRaw).trim();
      if (collectionId) {
        validateId(collectionId);
        const ownsCollection = await verifyOwnership("resourceCollection", collectionId, userId);
        if (!ownsCollection) {
          redirect(`/areas/${areaId}?error=unauthorized`);
        }
      }
    }

    if (target === "inbox") {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.INBOX, areaId: null, projectId: null, resourceCollectionId: null, archivedAt: null } });
    } else if (target === "project" && projectId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.PROJECT, projectId, areaId: null, resourceCollectionId: null, archivedAt: null } });
    } else if (target === "resource" && collectionId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.RESOURCE, resourceCollectionId: collectionId, areaId: null, projectId: null, archivedAt: null } });
    } else if (target === "archive") {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.ARCHIVE, archivedAt: new Date(), areaId: null, projectId: null, resourceCollectionId: null } });
    }
    await touchArea(userId, areaId);
    redirect(`/areas/${areaId}`);
  } catch (error) {
    logger.error("Error moving item", error);
    redirect(`/areas/${areaId}?error=move_failed`);
  }
}
