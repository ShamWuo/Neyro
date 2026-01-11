"use server";

import { ensureProjectLimit, touchCollection, createProjectWithLimit } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAuth, verifyOwnership, verifyBulkOwnership } from "@/lib/security";
import { validateId, sanitizeString } from "@/lib/validation";
import { logger } from "@/lib/logger";

export async function convertAction(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    const collectionIdRaw = formData.get("collectionId");
    if (!collectionIdRaw) return;
    const collectionId = String(collectionIdRaw).trim();
    validateId(collectionId);
    
    // Verify ownership of collection
    const ownsCollection = await verifyOwnership("resourceCollection", collectionId, userId);
    if (!ownsCollection) {
      logger.warn(`User ${userId} attempted to convert collection ${collectionId} without ownership`);
      redirect("/backlog?error=unauthorized");
    }
    
    await ensureProjectLimit(userId);
    const collection = await prisma.resourceCollection.findUnique({ where: { id: collectionId, userId }, include: { items: true } });
    if (!collection) {
      redirect("/backlog?error=collection_not_found");
      return;
    }
    
    // Verify ownership of all items in collection
    if (collection.items.length > 0) {
      const itemIds = collection.items.map((i) => i.id);
      if (itemIds.length > 100) {
        redirect("/backlog?error=too_many_items");
        return;
      }
      
      const ownsAllItems = await verifyBulkOwnership("item", itemIds, userId);
      if (!ownsAllItems) {
        logger.warn(`User ${userId} attempted to convert collection ${collectionId} with items without full ownership`);
        redirect("/backlog?error=unauthorized");
      }
    }
    
    // Sanitize collection data before creating project
    const sanitizedName = sanitizeString(collection.name, 500);
    const sanitizedOutcome = collection.description ? sanitizeString(collection.description, 2000) : "Outcome";
    
    const project = await createProjectWithLimit(userId, { userId, name: sanitizedName, outcome: sanitizedOutcome, status: ProjectStatus.ACTIVE } as any);
    
    if (collection.items.length) {
      await prisma.item.updateMany({ where: { id: { in: collection.items.map((i) => i.id) }, userId }, data: { classification: ItemClassification.PROJECT, projectId: project.id, resourceCollectionId: null } });
    }
    await touchCollection(userId, collectionId);
    redirect(`/projects/${project.id}`);
  } catch (error) {
    logger.error("Error converting collection to project", error);
    redirect("/backlog?error=convert_failed");
  }
}

