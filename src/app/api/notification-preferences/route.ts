import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { takeToken } from "@/lib/rateLimiter";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user settings if they exist
    const settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    const notifications = settings?.notifications as Record<string, unknown> | null;

    return NextResponse.json({
      preferences: notifications?.preferences || null,
      quietHours: notifications?.quietHours || null,
    });
  } catch (error) {
    logger.error("Error fetching notification preferences", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { preferences, quietHours } = body as { preferences?: unknown; quietHours?: unknown };

    // Update or create user settings
    const notificationsData = {
      preferences: preferences || null,
      quietHours: quietHours || null,
    };

    await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        notifications: notificationsData,
      },
      update: {
        notifications: notificationsData,
      },
    });

    logger.info("Notification preferences updated", { userId: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error updating notification preferences", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
