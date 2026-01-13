import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString, validateUrl } from "@/lib/validation";
import { isAllowed } from "@/lib/rate-limiter";
import { logger } from "@/lib/logger";
import { ItemClassification } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = request.headers.get("content-type") || "";
    let body: unknown;
    try {
      if (contentType.includes("application/json")) {
        body = await request.json();
      } else {
        return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
      }
    } catch (_e) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const bodyObj = body as Record<string, unknown>;
    const title = typeof bodyObj.title === "string" ? sanitizeString(bodyObj.title, 500) : "";
    const details = typeof bodyObj.details === "string" ? sanitizeString(bodyObj.details, 5000) : null;
    const url = typeof bodyObj.url === "string" && bodyObj.url.trim() ? validateUrl(bodyObj.url) : null;

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Rate-limit quick captures to prevent abuse
    try {
      const allowed = await isAllowed(`quick-capture:user:${session.user.id}`, 12, 60_000);
      if (!allowed) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }
    } catch (e) {
      // If rate limiter fails, log and continue to allow request (best-effort)
      logger.warn("quick-capture: rate limiter error", { error: (e as Error)?.message || String(e) });
    }

    const item = await prisma.item.create({
      data: {
        userId: session.user.id,
        title,
        details,
        url,
        classification: ItemClassification.INBOX,
      },
    });

    try {
      logger.info("Quick capture created", { userId: session.user.id, itemId: item.id, title: item.title });
    } catch (_e) {
      // ignore logging failures
    }

    // Persist lightweight telemetry about captures for analytics and abuse detection
    try {
      const userAgent = request.headers.get("user-agent") || undefined;
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          type: "quick_capture",
          meta: {
            itemId: item.id,
            source: typeof bodyObj.source === "string" ? bodyObj.source : "quick_capture",
            userAgent,
            ip,
          },
        },
      });
    } catch (e) {
      // Telemetry failures should not block the capture
      logger.warn("quick-capture: failed to persist telemetry", { error: (e as Error)?.message || String(e) });
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "unknown" }, { status: 500 });
  }
}

export const runtime = "nodejs";
