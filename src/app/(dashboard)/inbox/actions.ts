"use server";

import { auth } from "@/auth";
import { ensureProjectLimit, touchArea, touchCollection, touchProject } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { ItemClassification, ItemType, ProjectStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAuth, verifyOwnership, validateAndSanitizeString, validateIdArray } from "@/lib/security";
import { sanitizeString, validateUrl } from "@/lib/validation";

export async function createItem(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
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
    
    // Validate due date
    const dueDateRaw = formData.get("dueDate");
    let dueDate: Date | null = null;
    if (dueDateRaw) {
      try {
        dueDate = new Date(String(dueDateRaw));
        if (isNaN(dueDate.getTime())) dueDate = null;
      } catch {
        dueDate = null;
      }
    }
    
    await prisma.item.create({ data: { userId, title, details, url, type, classification: ItemClassification.INBOX, dueDate } });
    redirect("/inbox");
  } catch (error) {
    logger.error("Error creating item", error);
    redirect("/inbox?error=create_failed");
  }
}

export async function updateItem(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    const itemIdRaw = formData.get("itemId");
    if (!itemIdRaw) return;
    const itemId = String(itemIdRaw).trim();
    
    // Verify ownership before updating
    const ownsItem = await verifyOwnership("item", itemId, userId);
    if (!ownsItem) {
      logger.warn(`User ${userId} attempted to update item ${itemId} without ownership`);
      redirect("/inbox?error=unauthorized");
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
    
    // Validate due date
    const dueDateRaw = formData.get("dueDate");
    let dueDate: Date | null = null;
    if (dueDateRaw) {
      try {
        dueDate = new Date(String(dueDateRaw));
        if (isNaN(dueDate.getTime())) dueDate = null;
      } catch {
        dueDate = null;
      }
    }
    
    const isDone = String(formData.get("isDone") ?? "") === "on";
    await prisma.item.update({ where: { id: itemId, userId }, data: { title, details, url, type, dueDate, isDone } });
    redirect("/inbox");
  } catch (error) {
    logger.error("Error updating item", error);
    redirect("/inbox?error=update_failed");
  }
}

export async function moveToProject(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  try {
    const itemId = String(formData.get("itemId") ?? "");
    const projectIdRaw = String(formData.get("projectId") ?? "");
    const newName = String(formData.get("newProjectName") ?? "").trim();
    const newOutcome = String(formData.get("newProjectOutcome") ?? "").trim();
    const newDeadline = String(formData.get("newProjectDeadline") ?? "").trim();
    let projectId = projectIdRaw || null;

    if (!projectId && newName && newOutcome) {
      await ensureProjectLimit(userId);
      let deadline: Date | null = null;
      if (newDeadline) {
        try {
          deadline = new Date(newDeadline);
          if (isNaN(deadline.getTime())) deadline = null;
        } catch {
          deadline = null;
        }
      }
      const created = await prisma.project.create({
        data: { userId, name: newName, outcome: newOutcome, deadline, status: ProjectStatus.ACTIVE },
      });
      projectId = created.id;
    }

    if (!itemId || !projectId) return;
    await prisma.item.update({
      where: { id: itemId, userId },
      data: { classification: ItemClassification.PROJECT, projectId, areaId: null, resourceCollectionId: null, archivedAt: null },
    });
    await touchProject(userId, projectId);
    redirect("/inbox");
  } catch (error) {
    logger.error("Error moving item to project", error);
    redirect("/inbox?error=move_failed");
  }
}

export async function moveToArea(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  try {
    const itemId = String(formData.get("itemId") ?? "");
    const areaIdRaw = String(formData.get("areaId") ?? "");
    const newName = String(formData.get("newAreaName") ?? "").trim();
    const newStandard = String(formData.get("newAreaStandard") ?? "").trim();
    let areaId = areaIdRaw || null;

    if (!areaId && newName && newStandard) {
      const created = await prisma.area.create({ data: { userId, name: newName, standard: newStandard } });
      areaId = created.id;
    }

    if (!itemId || !areaId) return;
    await prisma.item.update({
      where: { id: itemId, userId },
      data: { classification: ItemClassification.AREA, areaId, projectId: null, resourceCollectionId: null, archivedAt: null },
    });
    await touchArea(userId, areaId);
    redirect("/inbox");
  } catch (error) {
    logger.error("Error moving item to area", error);
    redirect("/inbox?error=move_failed");
  }
}

export async function moveToResource(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  try {
    const itemId = String(formData.get("itemId") ?? "");
    const collectionIdRaw = String(formData.get("collectionId") ?? "");
    const newName = String(formData.get("newCollectionName") ?? "").trim();
    let collectionId = collectionIdRaw || null;
    if (!collectionId && newName) {
      const created = await prisma.resourceCollection.create({ data: { userId, name: newName } });
      collectionId = created.id;
    }
    if (!itemId || !collectionId) return;
    await prisma.item.update({
      where: { id: itemId, userId },
      data: { classification: ItemClassification.RESOURCE, resourceCollectionId: collectionId, projectId: null, areaId: null, archivedAt: null },
    });
    await touchCollection(userId, collectionId);
    redirect("/inbox");
  } catch (error) {
    logger.error("Error moving item to resource", error);
    redirect("/inbox?error=move_failed");
  }
}

export async function bulkClassify(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    const selectedRaw = formData.getAll("selected");
    if (!selectedRaw.length) return;
    
    // Validate IDs
    const selected = validateIdArray(selectedRaw, 100);
    
    // Verify ownership of all items
    const count = await prisma.item.count({ where: { id: { in: selected }, userId } });
    if (count !== selected.length) {
      logger.warn(`User ${userId} attempted bulk classify on items without full ownership`);
      redirect("/inbox?error=unauthorized");
    }

    const classificationRaw = String(formData.get("classification") ?? "").trim();
    const classification = classificationRaw as ItemClassification;

    if (!Object.values(ItemClassification).includes(classification)) {
      return;
    }

    let data: {
      classification: ItemClassification;
      projectId?: string | null;
      areaId?: string | null;
      resourceCollectionId?: string | null;
      archivedAt?: Date | null;
    } | null = null;

    if (classification === ItemClassification.PROJECT) {
      const projectId = String(formData.get("projectId") ?? "").trim();
      if (!projectId) return;
      data = { classification: ItemClassification.PROJECT, projectId, areaId: null, resourceCollectionId: null, archivedAt: null };
    } else if (classification === ItemClassification.AREA) {
      const areaId = String(formData.get("areaId") ?? "").trim();
      if (!areaId) return;
      data = { classification: ItemClassification.AREA, areaId, projectId: null, resourceCollectionId: null, archivedAt: null };
    } else if (classification === ItemClassification.RESOURCE) {
      const resourceCollectionId = String(formData.get("resourceCollectionId") ?? "").trim();
      if (!resourceCollectionId) return;
      data = { classification: ItemClassification.RESOURCE, resourceCollectionId, areaId: null, projectId: null, archivedAt: null };
    } else if (classification === ItemClassification.ARCHIVE) {
      const confirmArchive = String(formData.get("confirmArchive") ?? "");
      if (confirmArchive !== "on") {
        return;
      }
      data = { classification: ItemClassification.ARCHIVE, archivedAt: new Date(), projectId: null, areaId: null, resourceCollectionId: null };
    } else if (classification === ItemClassification.INBOX) {
      data = { classification: ItemClassification.INBOX, projectId: null, areaId: null, resourceCollectionId: null, archivedAt: null };
    }

    if (!data) return;

    await prisma.item.updateMany({
      where: { id: { in: selected }, userId },
      data,
    });
    redirect("/inbox");
  } catch (error) {
    logger.error("Error bulk classifying items", error);
    redirect("/inbox?error=bulk_failed");
  }
}

