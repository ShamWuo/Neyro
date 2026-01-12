import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification } from "@prisma/client";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeString, validateUrl } from "@/lib/validation";
import { isAllowed } from "@/lib/rate-limiter";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

const createSchema = z.object({
  title: z.string().min(1).max(500),
  details: z.string().max(10000).optional(),
  url: z.string().url().max(2048).optional().or(z.literal("")),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const items = await prisma.item.findMany({
      where: { userId: session.user.id, classification: ItemClassification.INBOX, archivedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    logger.error("Error fetching items", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limiting
    try {
      const allowed = await isAllowed(`user:${session.user.id}`, 20, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
      console.warn("Rate limiter check failed, allowing items create request:", e instanceof Error ? e.message : String(e));
    }

    // Check request size
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    const contentType = request.headers.get("content-type");
    let body: Record<string, unknown>;

    try {
      if (contentType?.includes("application/json")) {
        body = await request.json() as Record<string, unknown>;
      } else {
        const formData = await request.formData();
        body = {
          title: formData.get("title"),
          details: formData.get("details") || undefined,
          url: formData.get("url") || undefined,
        };
      }
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const item = await prisma.item.create({
      data: {
        userId: session.user.id,
        title: sanitizeString(parsed.data.title, 500),
        details: parsed.data.details ? sanitizeString(parsed.data.details, 10000) : null,
        url: validateUrl(parsed.data.url),
        classification: ItemClassification.INBOX,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    logger.error("Error creating item", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
