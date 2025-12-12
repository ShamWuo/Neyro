import { ItemType } from "@prisma/client";

export const MAX_TEXT_CHARS = 5000;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

class ValidationError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export function validateText(text: string) {
  const t = text?.trim?.() ?? "";
  if (!t) return null;
  if (t.length > MAX_TEXT_CHARS) {
    throw new ValidationError(`Text too long (max ${MAX_TEXT_CHARS} chars)`, 413);
  }
  return t;
}

export async function validateImage(file: File | null) {
  if (!file) return null;
  if (file.size === 0) return null;
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ValidationError(`Image too large (max ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)}MB)`, 413);
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mime = file.type || "image/png";
  return `data:${mime};base64,${base64}`;
}

export function normalizeType(type?: string) {
  if (!type) return ItemType.NOTE;
  const t = type.toUpperCase();
  if (t === "TASK") return ItemType.TASK;
  return ItemType.NOTE;
}
