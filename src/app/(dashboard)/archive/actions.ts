"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAuth, verifyOwnership, validateIdArray } from "@/lib/security";
import { validateId } from "@/lib/validation";
import { logger } from "@/lib/logger";

export async function restoreItem(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate item ID
    const itemIdRaw = formData.get("itemId");
    if (!itemIdRaw) return;
    const itemId = String(itemIdRaw).trim();
    validateId(itemId);
    
    // Verify ownership of archived item
    const item = await prisma.item.findUnique({ where: { id: itemId, userId } });
    if (!item || !item.archivedAt) {
      logger.warn(`User ${userId} attempted to restore non-existent or non-archived item ${itemId}`);
      redirect("/archive?error=unauthorized");
    }

    const target = String(formData.get("target") ?? "");
    const projectIdRaw = formData.get("projectId");
    const areaIdRaw = formData.get("areaId");
    const collectionIdRaw = formData.get("collectionId");
    
    // Validate target is a valid classification
    const validTargets = ["project", "area", "resource", "inbox"];
    if (!validTargets.includes(target) && target !== "") {
      redirect("/archive?error=invalid_target");
    }
    
    let projectId: string | null = null;
    let areaId: string | null = null;
    let collectionId: string | null = null;
    
    if (projectIdRaw && target === "project") {
      projectId = String(projectIdRaw).trim();
      if (projectId) {
        validateId(projectId);
        const ownsProject = await verifyOwnership("project", projectId, userId);
        if (!ownsProject) {
          redirect("/archive?error=unauthorized");
        }
      }
    }
    
    if (areaIdRaw && target === "area") {
      areaId = String(areaIdRaw).trim();
      if (areaId) {
        validateId(areaId);
        const ownsArea = await verifyOwnership("area", areaId, userId);
        if (!ownsArea) {
          redirect("/archive?error=unauthorized");
        }
      }
    }
    
    if (collectionIdRaw && target === "resource") {
      collectionId = String(collectionIdRaw).trim();
      if (collectionId) {
        validateId(collectionId);
        const ownsCollection = await verifyOwnership("resourceCollection", collectionId, userId);
        if (!ownsCollection) {
          redirect("/archive?error=unauthorized");
        }
      }
    }

    if (target === "project" && projectId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.PROJECT, projectId, areaId: null, resourceCollectionId: null, archivedAt: null } });
    } else if (target === "area" && areaId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.AREA, areaId, projectId: null, resourceCollectionId: null, archivedAt: null } });
    } else if (target === "resource" && collectionId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.RESOURCE, resourceCollectionId: collectionId, projectId: null, areaId: null, archivedAt: null } });
    } else {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.INBOX, archivedAt: null, projectId: null, areaId: null, resourceCollectionId: null } });
    }
    redirect("/archive");
  } catch (error) {
    logger.error("Error restoring item", error);
    redirect("/archive?error=restore_failed");
  }
}

export async function deleteItemAction(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate item ID
    const itemIdRaw = formData.get("itemId");
    if (!itemIdRaw) return;
    const itemId = String(itemIdRaw).trim();
    validateId(itemId);
    
    // Verify ownership before deleting
    const ownsItem = await verifyOwnership("item", itemId, userId);
    if (!ownsItem) {
      logger.warn(`User ${userId} attempted to delete item ${itemId} without ownership`);
      redirect("/archive?error=unauthorized");
    }
    
    await prisma.item.delete({ where: { id: itemId, userId } });
    redirect("/archive");
  } catch (error) {
    logger.error("Error deleting item", error);
    redirect("/archive?error=delete_failed");
  }
}

export async function restoreProjectAction(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate project ID
    const idRaw = formData.get("id");
    if (!idRaw) return;
    const id = String(idRaw).trim();
    validateId(id);
    
    // Verify ownership and that project is archived
    const project = await prisma.project.findUnique({ where: { id, userId } });
    if (!project || !project.archivedAt) {
      logger.warn(`User ${userId} attempted to restore non-existent or non-archived project ${id}`);
      redirect("/archive?error=unauthorized");
    }
    
    const { ProjectStatus } = await import("@prisma/client");
    await prisma.project.update({ where: { id, userId }, data: { archivedAt: null, status: ProjectStatus.PAUSED } });
    redirect("/archive");
  } catch (error) {
    logger.error("Error restoring project", error);
    redirect("/archive?error=restore_failed");
  }
}

export async function restoreAreaAction(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate area ID
    const idRaw = formData.get("id");
    if (!idRaw) return;
    const id = String(idRaw).trim();
    validateId(id);
    
    // Verify ownership and that area is archived
    const area = await prisma.area.findUnique({ where: { id, userId } });
    if (!area || !area.archivedAt) {
      logger.warn(`User ${userId} attempted to restore non-existent or non-archived area ${id}`);
      redirect("/archive?error=unauthorized");
    }
    
    await prisma.area.update({ where: { id, userId }, data: { archivedAt: null } });
    redirect("/archive");
  } catch (error) {
    logger.error("Error restoring area", error);
    redirect("/archive?error=restore_failed");
  }
}

