import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";

export const MAX_ACTIVE_PROJECTS = 7;

export async function getActiveProjectCount(userId: string) {
  return prisma.project.count({ where: { userId, status: ProjectStatus.ACTIVE, archivedAt: null } });
}

export async function ensureProjectLimit(userId: string) {
  const count = await getActiveProjectCount(userId);
  if (count >= MAX_ACTIVE_PROJECTS) {
    throw new Error("You have reached the 7 active projects limit. Pause or complete one first.");
  }
}

export async function classifyItem({
  itemId,
  userId,
  classification,
  projectId,
  areaId,
  resourceCollectionId,
}: {
  itemId: string;
  userId: string;
  classification: ItemClassification;
  projectId?: string | null;
  areaId?: string | null;
  resourceCollectionId?: string | null;
}) {
  if (classification === ItemClassification.PROJECT && projectId) {
    await prisma.item.update({
      where: { id: itemId, userId },
      data: { classification, projectId, areaId: null, resourceCollectionId: null, archivedAt: null },
    });
    return;
  }
  if (classification === ItemClassification.AREA && areaId) {
    await prisma.item.update({
      where: { id: itemId, userId },
      data: { classification, areaId, projectId: null, resourceCollectionId: null, archivedAt: null },
    });
    return;
  }
  if (classification === ItemClassification.RESOURCE && resourceCollectionId) {
    await prisma.item.update({
      where: { id: itemId, userId },
      data: { classification, resourceCollectionId, areaId: null, projectId: null, archivedAt: null },
    });
    return;
  }
  if (classification === ItemClassification.ARCHIVE) {
    await prisma.item.update({
      where: { id: itemId, userId },
      data: { classification: ItemClassification.ARCHIVE, archivedAt: new Date(), projectId: null, areaId: null, resourceCollectionId: null },
    });
    return;
  }
  if (classification === ItemClassification.INBOX) {
    await prisma.item.update({
      where: { id: itemId, userId },
      data: {
        classification: ItemClassification.INBOX,
        projectId: null,
        areaId: null,
        resourceCollectionId: null,
        archivedAt: null,
      },
    });
    return;
  }
  throw new Error("Invalid classification payload");
}
