"use server";

import { auth } from "@/auth";
import { ensureProjectLimit, touchArea, touchCollection, touchProject, createProjectWithLimit } from "@/lib/para";
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
      const created = await createProjectWithLimit(userId, { userId, name: newName, outcome: newOutcome, deadline, status: ProjectStatus.ACTIVE } as any);
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

export async function saveClassifiedItem(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    const title = validateAndSanitizeString(formData.get("title"), 500, "Title");
    const details = sanitizeString(String(formData.get("details") ?? ""), 10000);
    const category = String(formData.get("category") ?? "area").toLowerCase();
    const sourceMode = String(formData.get("sourceMode") ?? "unknown");

    console.log(`[CAPTURE] Processing: "${title}" → category=${category} from mode=${sourceMode}`);

    // Create the item in inbox first
    const item = await prisma.item.create({
      data: {
        userId,
        title,
        details,
        classification: ItemClassification.INBOX,
      },
    });

    console.log(`[CAPTURE] Created inbox item: ${item.id}`);

    // Route to appropriate PARA bucket based on classification
    if (category === "project") {
      console.log(`[CAPTURE] Routing to PROJECT: "${title}"`);
      await ensureProjectLimit(userId);
      const project = await createProjectWithLimit(userId, {
        userId,
        name: title,
        outcome: `From ${sourceMode} capture: ${details.substring(0, 100)}`,
        status: ProjectStatus.ACTIVE,
      } as any);
      await prisma.item.update({
        where: { id: item.id },
        data: {
          classification: ItemClassification.PROJECT,
          projectId: project.id,
        },
      });
      await touchProject(userId, project.id);
      console.log(`[CAPTURE] Project created: ${project.id}`);
    } else if (category === "area") {
      console.log(`[CAPTURE] Routing to AREA: "${title}"`);
      const area = await prisma.area.create({
        data: {
          userId,
          name: title,
          standard: `From ${sourceMode} capture: ${details.substring(0, 100)}`,
        },
      });
      await prisma.item.update({
        where: { id: item.id },
        data: {
          classification: ItemClassification.AREA,
          areaId: area.id,
        },
      });
      await touchArea(userId, area.id);
      console.log(`[CAPTURE] Area created: ${area.id}`);
    } else if (category === "resource") {
      console.log(`[CAPTURE] Routing to RESOURCE: "${title}"`);
      const collection = await prisma.resourceCollection.create({
        data: {
          userId,
          name: title,
        },
      });
      await prisma.item.update({
        where: { id: item.id },
        data: {
          classification: ItemClassification.RESOURCE,
          resourceCollectionId: collection.id,
        },
      });
      await touchCollection(userId, collection.id);
      console.log(`[CAPTURE] Resource collection created: ${collection.id}`);
    } else {
      console.log(`[CAPTURE] Keeping in INBOX (unknown category: ${category})`);
    }

    console.log(`[CAPTURE] Complete: item=${item.id} title="${title}" category=${category}`);
  } catch (error) {
    console.error("[CAPTURE] Error:", error);
    logger.error("Error saving classified item", error);
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

