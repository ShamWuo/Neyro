import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendEmail, sendWelcomeEmail, sendWeeklyReviewReminder, sendUpgradePrompt } from "@/lib/email";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { takeToken } from "@/lib/rateLimiter";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

const sendEmailSchema = z.object({
  template: z.enum(["welcome", "weekly-review-reminder", "upgrade-prompt"]),
  reason: z.enum(["projects", "ai-credits", "exports", "templates"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting (prevent email spam)
    try {
      takeToken(`user:${session.user.id}`);
      // Stricter limit for email sending - only 1 per minute
      takeToken(`email:${session.user.id}`);
    } catch {
      return NextResponse.json({ error: "Too many requests. Please wait before sending another email." }, { status: 429 });
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

    const parsed = sendEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    switch (parsed.data.template) {
      case "welcome":
        await sendWelcomeEmail(user.email, user.name);
        break;
      case "weekly-review-reminder":
        await sendWeeklyReviewReminder(user.email, user.name);
        break;
      case "upgrade-prompt":
        if (!parsed.data.reason) {
          return NextResponse.json({ error: "Reason required for upgrade-prompt" }, { status: 400 });
        }
        await sendUpgradePrompt(user.email, parsed.data.reason);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error sending email", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
