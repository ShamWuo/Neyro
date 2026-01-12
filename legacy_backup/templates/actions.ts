"use server";

import { ensureProjectLimit, createProjectWithLimit } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { TemplateType, ProjectStatus, ItemClassification, ItemType } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAuth, validateAndSanitizeString } from "@/lib/security";
import { sanitizeString, validateId } from "@/lib/validation";
import { logger } from "@/lib/logger";

type TemplateData = {
  name?: string;
  outcome?: string;
  standard?: string;
  area?: string;
  items?: string[];
};

const toTemplateData = (value: unknown): TemplateData => {
  if (!value || typeof value !== "object" || value === null) return {};
  const record = value as Record<string, unknown>;
  const itemsValue = record.items;
  const items = Array.isArray(itemsValue) ? itemsValue.filter((entry): entry is string => typeof entry === "string") : undefined;

  return {
    name: typeof record.name === "string" ? record.name : undefined,
    outcome: typeof record.outcome === "string" ? record.outcome : undefined,
    standard: typeof record.standard === "string" ? record.standard : undefined,
    area: typeof record.area === "string" ? record.area : undefined,
    items,
  };
};

export async function createTemplate(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    // Validate and sanitize name
    const nameRaw = formData.get("name");
    if (!nameRaw) return;
    const name = validateAndSanitizeString(nameRaw, 500, "Name");
    
    // Validate type
    const typeRaw = formData.get("type");
    let type: TemplateType = TemplateType.PROJECT;
    if (typeRaw && Object.values(TemplateType).includes(typeRaw as TemplateType)) {
      type = typeRaw as TemplateType;
    }
    
    // Sanitize description
    const descriptionRaw = formData.get("description");
    const description = descriptionRaw ? sanitizeString(String(descriptionRaw), 2000) : null;
    
    // Validate and sanitize template data
    const dataRaw = formData.get("data");
    let data: TemplateData = {};
    if (dataRaw) {
      try {
        const parsed = JSON.parse(String(dataRaw));
        const templateData = toTemplateData(parsed);
        
        // Sanitize template data fields
        if (templateData.name) {
          templateData.name = sanitizeString(templateData.name, 500);
        }
        if (templateData.outcome) {
          templateData.outcome = sanitizeString(templateData.outcome, 2000);
        }
        if (templateData.standard) {
          templateData.standard = sanitizeString(templateData.standard, 2000);
        }
        if (templateData.area) {
          templateData.area = sanitizeString(templateData.area, 500);
        }
        if (templateData.items) {
          // Limit items and sanitize each
          const maxItems = 100;
          templateData.items = templateData.items
            .slice(0, maxItems)
            .map((item: string) => sanitizeString(item, 500));
        }
        
        data = templateData;
      } catch {
        // Invalid JSON, use empty data
        data = {};
      }
    }
    
    await prisma.template.create({ data: { userId, name, type, description, data } });
    redirect("/templates");
  } catch (error) {
    logger.error("Error creating template", error);
    redirect("/templates?error=create_failed");
  }
}

export async function applyTemplate(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    const templateIdRaw = formData.get("templateId");
    if (!templateIdRaw) return;
    const templateId = String(templateIdRaw).trim();
    validateId(templateId);
    
    // Verify ownership of template
    const template = await prisma.template.findUnique({ where: { id: templateId, userId } });
    if (!template) {
      logger.warn(`User ${userId} attempted to apply template ${templateId} without ownership`);
      redirect("/templates?error=unauthorized");
    }
    
    const templateData = toTemplateData(template.data);
    
    // Validate template type
    if (!Object.values(TemplateType).includes(template.type)) {
      redirect("/templates?error=invalid_template");
    }
    
    if (template.type === TemplateType.PROJECT) {
      await ensureProjectLimit(userId);
      
      // Sanitize template data
      const name = templateData.name ? sanitizeString(templateData.name, 500) : sanitizeString(template.name, 500);
      const outcome = templateData.outcome ? sanitizeString(templateData.outcome, 2000) : (template.description ? sanitizeString(template.description, 2000) : "Outcome");
      
      await createProjectWithLimit(userId, { userId, name, outcome, status: ProjectStatus.ACTIVE });
      redirect("/projects");
      return;
    }
    
    if (template.type === TemplateType.AREA) {
      // Sanitize template data
      const name = templateData.name ? sanitizeString(templateData.name, 500) : sanitizeString(template.name, 500);
      const standard = templateData.standard ? sanitizeString(templateData.standard, 2000) : (template.description ? sanitizeString(template.description, 2000) : "Standard");
      
      await prisma.area.create({ data: { userId, name, standard } });
      redirect("/areas");
      return;
    }
    
    if (template.type === TemplateType.CHECKLIST) {
      const areaNameRaw = templateData.area ?? "Checklist";
      const areaName = sanitizeString(areaNameRaw, 500);
      const area = await prisma.area.create({ data: { userId, name: areaName, standard: "Checklist" } });
      
      const items = templateData.items ?? [];
      // Limit items and sanitize each
      const maxItems = 100;
      const sanitizedItems = items
        .slice(0, maxItems)
        .map((title: string) => sanitizeString(title, 500))
        .filter((title: string) => title.length > 0);
      
      if (sanitizedItems.length > 0) {
        await prisma.item.createMany({
          data: sanitizedItems.map((title: string) => ({ userId, title, classification: ItemClassification.AREA, areaId: area.id, type: ItemType.TASK })),
        });
      }
      redirect(`/areas/${area.id}`);
      return;
    }
    
    redirect("/templates");
  } catch (error) {
    logger.error("Error applying template", error);
    redirect("/templates?error=apply_failed");
  }
}

