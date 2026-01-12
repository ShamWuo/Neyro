import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { isAllowed } from "@/lib/rate-limiter";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    try {
      const allowed = await isAllowed(`user:${session.user.id}`, 6, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
      console.warn("Rate limiter check failed, allowing onboarding complete request:", (e as Error)?.message || String(e));
    }

    // Check request size
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    // Mark onboarding as complete (you can add an onboardingComplete field to UserSettings)
    await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        // Add onboardingComplete: true if you add this field
      },
      update: {
        // Add onboardingComplete: true if you add this field
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error completing onboarding", error);
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
  }
}
