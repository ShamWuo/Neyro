"use server";

import { ensureProjectLimit, touchProject } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { ItemClassification, ItemType, ProjectStatus, SharePermission } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAuth, verifyOwnership, validateAndSanitizeString, validateEmail } from "@/lib/security";
import { sanitizeString, validateUrl, validateId } from "@/lib/validation";

export async function updateProject(projectId: string, formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate project ID
    validateId(projectId);
    
    // Verify ownership
    const ownsProject = await verifyOwnership("project", projectId, userId);
    if (!ownsProject) {
      logger.warn(`User ${userId} attempted to update project ${projectId} without ownership`);
      redirect(`/projects/${projectId}?error=unauthorized`);
    }

    // Validate and sanitize inputs
    const nameRaw = formData.get("name");
    const outcomeRaw = formData.get("outcome");
    if (!nameRaw || !outcomeRaw) return;
    
    const name = validateAndSanitizeString(nameRaw, 500, "Name");
    const outcome = validateAndSanitizeString(outcomeRaw, 2000, "Outcome");
    
    // Validate deadline
    const deadlineRaw = formData.get("deadline");
    let deadline: Date | null = null;
    if (deadlineRaw) {
      try {
        deadline = new Date(String(deadlineRaw));
        if (isNaN(deadline.getTime())) deadline = null;
      } catch {
        deadline = null;
      }
    }
    
    await prisma.project.update({
      where: { id: projectId, userId },
      data: { name, outcome, deadline },
    });
    await touchProject(userId, projectId);
    redirect(`/projects/${projectId}`);
  } catch (error) {
    logger.error("Error updating project", error);
    redirect(`/projects/${projectId}?error=update_failed`);
  }
}

export async function changeStatus(projectId: string, userId: string, status: ProjectStatus) {
  const session = await requireAuth();
  
  // Verify userId matches session
  if (session.user.id !== userId) {
    logger.warn(`User ${session.user.id} attempted to change status for project owned by ${userId}`);
    redirect(`/projects/${projectId}?error=unauthorized`);
  }

  try {
    // Validate project ID
    validateId(projectId);
    
    // Verify ownership
    const ownsProject = await verifyOwnership("project", projectId, userId);
    if (!ownsProject) {
      logger.warn(`User ${userId} attempted to change status for project ${projectId} without ownership`);
      redirect(`/projects/${projectId}?error=unauthorized`);
    }
    
    // Validate status is a valid enum value
    if (!Object.values(ProjectStatus).includes(status)) {
      redirect(`/projects/${projectId}?error=invalid_status`);
    }
    
    if (status === ProjectStatus.ACTIVE) {
      await ensureProjectLimit(userId);
    }
    await prisma.project.update({ where: { id: projectId, userId }, data: { status } });
    await touchProject(userId, projectId);
    redirect(`/projects/${projectId}`);
  } catch (error) {
    logger.error("Error changing project status", error);
    redirect(`/projects/${projectId}?error=status_failed`);
  }
}

export async function archiveProject(projectId: string, userId: string) {
  const session = await requireAuth();
  
  // Verify userId matches session
  if (session.user.id !== userId) {
    logger.warn(`User ${session.user.id} attempted to archive project owned by ${userId}`);
    redirect("/projects?error=unauthorized");
  }

  try {
    // Validate project ID
    validateId(projectId);
    
    // Verify ownership
    const ownsProject = await verifyOwnership("project", projectId, userId);
    if (!ownsProject) {
      logger.warn(`User ${userId} attempted to archive project ${projectId} without ownership`);
      redirect("/projects?error=unauthorized");
    }
    
    await prisma.project.update({ where: { id: projectId, userId }, data: { archivedAt: new Date(), status: ProjectStatus.COMPLETED } });
    redirect("/projects");
  } catch (error) {
    logger.error("Error archiving project", error);
    redirect("/projects?error=archive_failed");
  }
}

export async function addShare(projectId: string, formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate project ID
    validateId(projectId);
    
    // Verify ownership
    const ownsProject = await verifyOwnership("project", projectId, userId);
    if (!ownsProject) {
      logger.warn(`User ${userId} attempted to share project ${projectId} without ownership`);
      redirect(`/projects/${projectId}?error=unauthorized`);
    }

    // Validate and sanitize email
    const emailRaw = formData.get("email");
    if (!emailRaw) return;
    
    const email = validateEmail(emailRaw);
    
    await prisma.shareAccess.create({
      data: { ownerId: userId, projectId, email, permission: SharePermission.VIEW },
    });
    redirect(`/projects/${projectId}`);
  } catch (error) {
    logger.error("Error adding share", error);
    redirect(`/projects/${projectId}?error=share_failed`);
  }
}

export async function addItem(projectId: string, formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate project ID
    validateId(projectId);
    
    // Verify ownership
    const ownsProject = await verifyOwnership("project", projectId, userId);
    if (!ownsProject) {
      logger.warn(`User ${userId} attempted to add item to project ${projectId} without ownership`);
      redirect(`/projects/${projectId}?error=unauthorized`);
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
        classification: ItemClassification.PROJECT,
        projectId,
      },
    });
    await touchProject(userId, projectId);
    redirect(`/projects/${projectId}`);
  } catch (error) {
    logger.error("Error adding item", error);
    redirect(`/projects/${projectId}?error=add_item_failed`);
  }
}

export async function updateItem(projectId: string, formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate project ID
    validateId(projectId);
    
    // Verify ownership of project
    const ownsProject = await verifyOwnership("project", projectId, userId);
    if (!ownsProject) {
      logger.warn(`User ${userId} attempted to update item in project ${projectId} without ownership`);
      redirect(`/projects/${projectId}?error=unauthorized`);
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
      redirect(`/projects/${projectId}?error=unauthorized`);
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
    await touchProject(userId, projectId);
    redirect(`/projects/${projectId}`);
  } catch (error) {
    logger.error("Error updating item", error);
    redirect(`/projects/${projectId}?error=update_item_failed`);
  }
}

export async function toggleDone(projectId: string, itemId: string, isDone: boolean) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate IDs
    validateId(projectId);
    validateId(itemId);
    
    // Verify ownership of project
    const ownsProject = await verifyOwnership("project", projectId, userId);
    if (!ownsProject) {
      logger.warn(`User ${userId} attempted to toggle item in project ${projectId} without ownership`);
      redirect(`/projects/${projectId}?error=unauthorized`);
    }
    
    // Verify ownership of item
    const ownsItem = await verifyOwnership("item", itemId, userId);
    if (!ownsItem) {
      logger.warn(`User ${userId} attempted to toggle item ${itemId} without ownership`);
      redirect(`/projects/${projectId}?error=unauthorized`);
    }
    
    await prisma.item.update({ where: { id: itemId, userId }, data: { isDone: Boolean(isDone) } });
    await touchProject(userId, projectId);
    redirect(`/projects/${projectId}`);
  } catch (error) {
    logger.error("Error toggling item done status", error);
    redirect(`/projects/${projectId}?error=toggle_failed`);
  }
}

export async function moveItem(projectId: string, formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate project ID
    validateId(projectId);
    
    // Verify ownership of project
    const ownsProject = await verifyOwnership("project", projectId, userId);
    if (!ownsProject) {
      logger.warn(`User ${userId} attempted to move item in project ${projectId} without ownership`);
      redirect(`/projects/${projectId}?error=unauthorized`);
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
      redirect(`/projects/${projectId}?error=unauthorized`);
    }

    const target = String(formData.get("target") ?? "");
    const areaIdRaw = formData.get("areaId");
    const collectionIdRaw = formData.get("collectionId");
    
    // Validate target is a valid classification
    const validTargets = ["inbox", "area", "resource", "archive"];
    if (!validTargets.includes(target)) {
      redirect(`/projects/${projectId}?error=invalid_target`);
    }
    
    let areaId: string | null = null;
    let collectionId: string | null = null;
    
    if (areaIdRaw) {
      areaId = String(areaIdRaw).trim();
      if (areaId && target === "area") {
        validateId(areaId);
        const ownsArea = await verifyOwnership("area", areaId, userId);
        if (!ownsArea) {
          redirect(`/projects/${projectId}?error=unauthorized`);
        }
      }
    }
    
    if (collectionIdRaw) {
      collectionId = String(collectionIdRaw).trim();
      if (collectionId && target === "resource") {
        validateId(collectionId);
        const ownsCollection = await verifyOwnership("resourceCollection", collectionId, userId);
        if (!ownsCollection) {
          redirect(`/projects/${projectId}?error=unauthorized`);
        }
      }
    }

    if (target === "inbox") {
      await prisma.item.update({
        where: { id: itemId, userId },
        data: { classification: ItemClassification.INBOX, projectId: null, areaId: null, resourceCollectionId: null, archivedAt: null },
      });
    } else if (target === "area" && areaId) {
      await prisma.item.update({
        where: { id: itemId, userId },
        data: { classification: ItemClassification.AREA, areaId, projectId: null, resourceCollectionId: null, archivedAt: null },
      });
    } else if (target === "resource" && collectionId) {
      await prisma.item.update({
        where: { id: itemId, userId },
        data: { classification: ItemClassification.RESOURCE, resourceCollectionId: collectionId, projectId: null, areaId: null, archivedAt: null },
      });
    } else if (target === "archive") {
      await prisma.item.update({
        where: { id: itemId, userId },
        data: { classification: ItemClassification.ARCHIVE, archivedAt: new Date(), projectId: null, areaId: null, resourceCollectionId: null },
      });
    }
    await touchProject(userId, projectId);
    redirect(`/projects/${projectId}`);
  } catch (error) {
    logger.error("Error moving item", error);
    redirect(`/projects/${projectId}?error=move_failed`);
  }
}

