import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { isAllowed } from "@/lib/rate-limiter";
import { validateId } from "@/lib/validation";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    try {
      const allowed = await isAllowed(`user:${session.user.id}`, 30, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
       
      console.warn("Rate limiter check failed, allowing notification read request:", (e as Error)?.message || String(e));
    }

    const { id } = await params;
    try {
      validateId(id);
    } catch {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
    }

    // TODO: Implement when Notification model is added to schema
    // For now, just log and return success

    logger.info("Notification marked as read", { notificationId: id, userId: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error marking notification as read", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
