"use server";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { ItemClassification, ItemType, ProjectStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { analyzeParaCapture } from "@/lib/ai";
import { requireAuth, verifyOwnership, verifyBulkOwnership, validateAndSanitizeString } from "@/lib/security";
import { sanitizeString, validateUrl, validateId } from "@/lib/validation";

export async function classifyInboxItem(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate item ID
    const itemIdRaw = formData.get("itemId");
    if (!itemIdRaw) return;
    const itemId = String(itemIdRaw).trim();
    validateId(itemId);
    
    // Verify ownership of item
    const ownsItem = await verifyOwnership("item", itemId, userId);
    if (!ownsItem) {
      logger.warn(`User ${userId} attempted to classify item ${itemId} without ownership`);
      redirect("/review?step=1&error=unauthorized");
    }

    const target = String(formData.get("target") ?? "");
    const projectIdRaw = formData.get("projectId");
    const areaIdRaw = formData.get("areaId");
    const collectionIdRaw = formData.get("collectionId");
    
    // Validate target is a valid classification
    const validTargets = ["project", "area", "resource", "archive", "inbox", "ai"];
    if (!validTargets.includes(target)) {
      redirect("/review?step=1&error=invalid_target");
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
          redirect("/review?step=1&error=unauthorized");
        }
      }
    }
    
    if (areaIdRaw && target === "area") {
      areaId = String(areaIdRaw).trim();
      if (areaId) {
        validateId(areaId);
        const ownsArea = await verifyOwnership("area", areaId, userId);
        if (!ownsArea) {
          redirect("/review?step=1&error=unauthorized");
        }
      }
    }
    
    if (collectionIdRaw && target === "resource") {
      collectionId = String(collectionIdRaw).trim();
      if (collectionId) {
        validateId(collectionId);
        const ownsCollection = await verifyOwnership("resourceCollection", collectionId, userId);
        if (!ownsCollection) {
          redirect("/review?step=1&error=unauthorized");
        }
      }
    }

    if (target === "project" && projectId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.PROJECT, projectId, areaId: null, resourceCollectionId: null, archivedAt: null } });
    } else if (target === "area" && areaId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.AREA, areaId, projectId: null, resourceCollectionId: null, archivedAt: null } });
    } else if (target === "resource" && collectionId) {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.RESOURCE, resourceCollectionId: collectionId, projectId: null, areaId: null, archivedAt: null } });
    } else if (target === "archive") {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.ARCHIVE, archivedAt: new Date(), projectId: null, areaId: null, resourceCollectionId: null } });
    } else if (target === "inbox") {
      await prisma.item.update({ where: { id: itemId, userId }, data: { classification: ItemClassification.INBOX, projectId: null, areaId: null, resourceCollectionId: null, archivedAt: null } });
    } else if (target === "ai") {
      const item = await prisma.item.findUnique({ where: { id: itemId, userId } });
      if (!item) {
        redirect("/review?step=1&error=item_not_found");
        return;
      }
      
      // AI processing - validate input before sending to AI
      const textInput = `${item.title}\n${item.details ?? ""}`.trim();
      if (textInput.length > 5000) {
        redirect("/review?step=1&error=text_too_long");
        return;
      }
      
      try {
        const decision = await analyzeParaCapture({ text: textInput });
        
        // Sanitize AI response before storing
        const sanitizedTitle = decision.title ? sanitizeString(decision.title, 500) : item.title;
        const sanitizedDetails = decision.details ? sanitizeString(decision.details, 10000) : item.details;
        
        await prisma.item.update({
          where: { id: itemId, userId },
          data: {
            title: sanitizedTitle,
            details: sanitizedDetails,
            classification: decision.classification,
            type: decision.type ?? item.type,
            projectId: null,
            areaId: null,
            resourceCollectionId: null,
            archivedAt: decision.classification === ItemClassification.ARCHIVE ? new Date() : null,
          },
        });
      } catch (error) {
        logger.error("Error in AI classification", error);
        redirect("/review?step=1&error=ai_failed");
        return;
      }
    }
    redirect("/review?step=1");
  } catch (error) {
    logger.error("Error classifying item", error);
    redirect("/review?step=1&error=classify_failed");
  }
}

export async function applyProjectDecisions(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    const entries = Array.from(formData.entries()).filter(([key]) => key.startsWith("decision-")) as [string, FormDataEntryValue][];
    const decisions = entries.map(([key, value]) => ({ id: key.replace("decision-", ""), status: value as ProjectStatus })).filter((d) => d.id && Object.values(ProjectStatus).includes(d.status));
    
    if (!decisions.length) {
      redirect("/review?step=3");
      return;
    }
    
    // Validate all project IDs and verify ownership
    const projectIds = decisions.map((d) => d.id);
    if (projectIds.length > 100) {
      redirect("/review?step=2&error=too_many_projects");
      return;
    }
    
    // Verify ownership of all projects
    const ownsAllProjects = await verifyBulkOwnership("project", projectIds, userId);
    if (!ownsAllProjects) {
      logger.warn(`User ${userId} attempted to update projects without full ownership`);
      redirect("/review?step=2&error=unauthorized");
    }
    
    const desiredActive = decisions.filter((d) => d.status === ProjectStatus.ACTIVE).length;
    const remainingActive = await prisma.project.count({ where: { userId, status: ProjectStatus.ACTIVE, archivedAt: null, NOT: { id: { in: projectIds } } } });
    if (desiredActive + remainingActive > 7) {
      redirect("/review?step=2&error=project_limit");
      return;
    }
    
    // Validate all status values are valid
    const validStatuses = Object.values(ProjectStatus);
    const allStatusesValid = decisions.every((d) => validStatuses.includes(d.status));
    if (!allStatusesValid) {
      redirect("/review?step=2&error=invalid_status");
      return;
    }
    
    await Promise.all(decisions.map((d) => prisma.project.update({ where: { id: d.id, userId }, data: { status: d.status } })));
    redirect("/review?step=3");
  } catch (error) {
    logger.error("Error applying project decisions", error);
    redirect("/review?step=2&error=update_failed");
  }
}

export async function toSummary(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    const areas = await prisma.area.findMany({ where: { userId, archivedAt: null } });
    const scores: { areaId: string; score: number }[] = [];
    const nextActions: { areaId: string; title: string; details: string | null; url: string | null }[] = [];
    
    formData.forEach((value, key) => {
      if (key.startsWith("area-")) {
        const areaId = key.replace("area-", "");
        if (areaId && areaId.length > 0 && areaId.length <= 100) {
          try {
            validateId(areaId); // Validate format
            const score = Number(value);
            if (Number.isFinite(score) && score >= 1 && score <= 5) {
              // Verify ownership of area
              scores.push({ areaId, score });
            }
          } catch {
            // Skip invalid area IDs
          }
        }
      }
      if (key.startsWith("next-")) {
        const areaId = key.replace("next-", "");
        if (areaId && areaId.length > 0 && areaId.length <= 100) {
          try {
            validateId(areaId); // Validate format
            const titleRaw = value;
            if (titleRaw) {
              try {
                const title = validateAndSanitizeString(titleRaw, 500, "Title");
                const detailsRaw = formData.get(`details-${areaId}`);
                const details = detailsRaw ? sanitizeString(String(detailsRaw), 10000) : null;
                const urlRaw = formData.get(`url-${areaId}`);
                const url = urlRaw ? validateUrl(urlRaw) : null;
                
                // Verify ownership of area before adding action
                nextActions.push({ areaId, title, details, url });
              } catch {
                // Skip invalid entries
              }
            }
          } catch {
            // Skip invalid area IDs
          }
        }
      }
    });
    
    // Verify all area IDs belong to user
    const areaIds = [...scores.map((s) => s.areaId), ...nextActions.map((a) => a.areaId)];
    const uniqueAreaIds = Array.from(new Set(areaIds));
    if (uniqueAreaIds.length > 0) {
      const ownsAllAreas = await verifyBulkOwnership("area", uniqueAreaIds, userId);
      if (!ownsAllAreas) {
        logger.warn(`User ${userId} attempted to review areas without full ownership`);
        redirect("/review?step=3&error=unauthorized");
      }
    }
    
    if (scores.length !== areas.length) {
      redirect("/review?step=3&error=score_all");
      return;
    }
    
    if (nextActions.length) {
      // Verify ownership of each area before creating items
      await Promise.all(
        nextActions.map(async (n) => {
          const ownsArea = await verifyOwnership("area", n.areaId, userId);
          if (!ownsArea) {
            throw new Error(`User does not own area ${n.areaId}`);
          }
          return prisma.item.create({ data: { userId, title: n.title, details: n.details, url: n.url, type: ItemType.TASK, classification: ItemClassification.AREA, areaId: n.areaId } });
        })
      );
    }
    
    const avg = scores.length > 0 ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length : 0;
    const encoded = encodeURIComponent(scores.map((s) => `${s.areaId}:${s.score}`).join(","));
    redirect(`/review?step=4&scores=${encoded}&avg=${avg}`);
  } catch (error) {
    logger.error("Error in review summary", error);
    redirect("/review?step=3&error=summary_failed");
  }
}

export async function finishReview(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    const scoresRaw = String(formData.get("scores") ?? "");
    if (!scoresRaw) {
      redirect("/review?step=4&error=missing_scores");
      return;
    }
    
    // Parse and validate scores
    const scorePairs = scoresRaw.split(",");
    if (scorePairs.length > 100) {
      redirect("/review?step=4&error=too_many_scores");
      return;
    }
    
    const scores = scorePairs.map((s) => {
      const [areaId, scoreStr] = s.split(":");
      const score = Number(scoreStr);
      
      // Validate score range and area ID format
      if (!areaId || areaId.length === 0 || areaId.length > 100) {
        throw new Error(`Invalid area ID in entry: ${s}`);
      }
      
      try {
        validateId(areaId); // Validate format
      } catch {
        throw new Error(`Invalid area ID format in entry: ${s}`);
      }
      
      if (!Number.isFinite(score) || score < 1 || score > 5) {
        throw new Error(`Invalid score in entry: ${s}`);
      }
      
      return { areaId, score };
    });

    // Verify ownership of all areas
    const areaIds = scores.map((s) => s.areaId);
    if (areaIds.length > 0) {
      const ownsAllAreas = await verifyBulkOwnership("area", areaIds, userId);
      if (!ownsAllAreas) {
        logger.warn(`User ${userId} attempted to finish review with areas without full ownership`);
        redirect("/review?step=4&error=unauthorized");
      }
    }

    await Promise.all(
      scores.map((s) =>
        prisma.area.update({
          where: { id: s.areaId, userId },
          data: { lastHealthScore: s.score, lastReviewDate: new Date() },
        })
      )
    );

    // Validate and sanitize review data
    const inboxCountRaw = formData.get("inboxCount");
    const activeProjectsCountRaw = formData.get("activeProjectsCount");
    const avgRaw = formData.get("avg");
    
    const inboxCount = inboxCountRaw ? Math.max(0, Math.floor(Number(inboxCountRaw))) : 0;
    const activeProjectsCount = activeProjectsCountRaw ? Math.max(0, Math.floor(Number(activeProjectsCountRaw))) : 0;
    const areaHealthAverage = avgRaw ? Math.max(0, Math.min(5, Number(avgRaw))) : 0;
    
    // Validate numbers are finite
    if (!Number.isFinite(inboxCount) || !Number.isFinite(activeProjectsCount) || !Number.isFinite(areaHealthAverage)) {
      redirect("/review?step=4&error=invalid_data");
      return;
    }

    await prisma.weeklyReview.create({
      data: {
        userId,
        inboxCount,
        activeProjectsCount,
        areaHealthAverage,
      },
    });

    redirect("/review?step=5");
  } catch (error) {
    logger.error("Error finishing review", error);
    redirect("/review?step=4&error=finish_failed");
  }
}

