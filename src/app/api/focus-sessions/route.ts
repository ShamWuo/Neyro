import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { takeToken } from "@/lib/rateLimiter";
import { validateAndSanitizeString } from "@/lib/security";
import { z } from "zod";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

const focusSessionSchema = z.object({
  label: z.string().min(1).max(200),
  minutes: z.number().int().min(1).max(1440), // Max 24 hours
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const parsed = focusSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Sanitize label
    const label = validateAndSanitizeString(parsed.data.label, 200, "Label");
    const minutes = Math.floor(parsed.data.minutes);

    const focusSession = await prisma.focusSession.create({
      data: {
        userId: session.user.id,
        label,
        minutes,
      },
    });

    logger.info("Focus session created", { sessionId: focusSession.id, userId: session.user.id });

    return NextResponse.json(focusSession, { status: 201 });
  } catch (error) {
    logger.error("Error creating focus session", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to create focus session" },
      { status: 500 }
    );
  }
}
