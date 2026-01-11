import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const adminToken = process.env.ADMIN_TOKEN;
    const provided = request.headers.get("x-admin-token");
    if (!adminToken || provided !== adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entries = await prisma.activityLog.findMany({
      where: { type: "quick_capture" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ items: entries });
  } catch (e) {
    logger.error("admin telemetry error", e);
    return NextResponse.json({ error: "Failed to fetch telemetry" }, { status: 500 });
  }
}

export const runtime = "nodejs";
