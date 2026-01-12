import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { checkSubscriptionLimit } from "@/lib/subscription";

export const MAX_ACTIVE_PROJECTS = 7;
export const MAX_ACTIVE_PROJECTS_FREE = 3;

export async function getActiveProjectCount(userId: string) {
  return prisma.project.count({ where: { userId, status: ProjectStatus.ACTIVE, archivedAt: null } });
}

export async function ensureProjectLimit(userId: string) {
  const limitCheck = await checkSubscriptionLimit(userId, "maxProjects");

  if (!limitCheck.allowed) {
    const limit = limitCheck.limit;

    if (limit === MAX_ACTIVE_PROJECTS_FREE) {
      throw new Error(
        `You've reached the free tier limit of ${limit} active projects. Upgrade to Focus to unlock 7 active projects.`
      );
    } else {
      throw new Error(
        `You have reached the ${limit} active projects limit. Pause or complete one first.`
      );
    }
  }
}

export async function createProjectWithLimit(userId: string, data: Prisma.ProjectUncheckedCreateInput) {
  const limitCheck = await checkSubscriptionLimit(userId, "maxProjects");

  if (!limitCheck.allowed) {
    const limit = limitCheck.limit;
    if (limit === MAX_ACTIVE_PROJECTS_FREE) {
      throw new Error(`You've reached the free tier limit of ${limit} active projects. Upgrade to Focus to unlock ${MAX_ACTIVE_PROJECTS} active projects.`);
    }
    throw new Error(`You have reached the ${limit} active projects limit. Pause or complete one first.`);
  }

  // Use a transaction to perform a count + create to reduce race window.
  const created = await prisma.$transaction(async (tx) => {
    const current = await tx.project.count({ where: { userId, status: ProjectStatus.ACTIVE, archivedAt: null } });
    if (current >= limitCheck.limit) {
      throw new Error(`You have reached the ${limitCheck.limit} active projects limit. Pause or complete one first.`);
    }
    // Ensure the provided data contains userId; preserve caller-supplied fields
    const payload = { ...(data as Record<string, unknown>), userId } as Prisma.ProjectUncheckedCreateInput;
    return tx.project.create({ data: payload });
  });

  return created;
}

export async function touchProject(userId: string, projectId: string) {
  await prisma.project.update({ where: { id: projectId, userId }, data: { lastActivityAt: new Date() } });
}

export async function touchArea(userId: string, areaId: string) {
  await prisma.area.update({ where: { id: areaId, userId }, data: { lastActivityAt: new Date() } });
}

export async function touchCollection(userId: string, collectionId: string) {
  await prisma.resourceCollection.update({ where: { id: collectionId, userId }, data: { lastActivityAt: new Date() } });
}

export function projectHealth(lastActivityAt: Date | null): "GREEN" | "YELLOW" | "RED" {
  if (!lastActivityAt) return "RED";
  const now = Date.now();
  const diffDays = (now - lastActivityAt.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 2) return "GREEN";
  if (diffDays <= 7) return "YELLOW";
  return "RED";
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
