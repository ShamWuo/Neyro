import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateShareToken, getSharedReview } from "@/lib/review-share";
import { logger } from "@/lib/logger";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const token = await generateShareToken(id);

    const shareUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/share/review/${token}`;

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
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
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

