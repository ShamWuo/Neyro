import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeString } from "@/lib/validation";
import { takeToken } from "@/lib/rateLimiter";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

const areaSchema = z.object({
  name: z.string().min(1).max(500),
  standard: z.string().min(1).max(2000),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const areas = await prisma.area.findMany({ where: { userId: session.user.id, archivedAt: null }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(areas);
  } catch (error) {
    logger.error("Error fetching areas", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // Rate limiting
    try {
      takeToken(`user:${session.user.id}`);
    } catch {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Check request size
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }
    
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    
    const parsed = areaSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    // Sanitize inputs
    const name = sanitizeString(parsed.data.name, 500);
    const standard = sanitizeString(parsed.data.standard, 2000);

    const area = await prisma.area.create({
      data: {
        userId: session.user.id,
        name,
        standard,
      },
    });
    return NextResponse.json(area, { status: 201 });
  } catch (error) {
    logger.error("Error creating area", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
