import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateShareToken, getSharedReview } from "@/lib/review-share";
import { logger } from "@/lib/logger";
import { isAllowed } from "@/lib/rate-limiter";
import { validateId } from "@/lib/validation";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limiting (prevent abuse of share token generation)
    try {
      const allowed = await isAllowed(`user:${session.user.id}`, 8, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Rate limiter check failed, allowing review share request:", e?.message || e);
    }

    const { id } = await params;
    
    try {
      validateId(id);
    } catch {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    // Verify ownership of review
    // Note: Reviews are created by users, so we check if the review belongs to the user
    const review = await prisma.weeklyReview.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!review || review.userId !== session.user.id) {
      logger.warn(`User ${session.user.id} attempted to share review ${id} without ownership`);
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const token = await generateShareToken(id);

    const shareUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3001"}/share/review/${token}`;

    return NextResponse.json({ token, url: shareUrl });
  } catch (error) {
    logger.error("Error generating share token", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting (prevent abuse of share token lookup)
    try {
      const ip = _request.headers.get("x-forwarded-for") ?? "anonymous";
      takeToken(`share:${ip}`);
    } catch {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id } = await params;
    
    try {
      validateId(id);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const review = await getSharedReview(id);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    logger.error("Error getting shared review", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

