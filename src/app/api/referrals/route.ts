import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateReferralCode, trackReferral } from "@/lib/referral";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { takeToken } from "@/lib/rateLimiter";
import { validateEmail } from "@/lib/validation";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limiting (prevent abuse)
    try {
      takeToken(`user:${session.user.id}`);
    } catch {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const code = await generateReferralCode(session.user.id);
    const referralUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3001"}/auth/signup?ref=${code}`;

    return NextResponse.json({ code, url: referralUrl });
  } catch (error) {
    logger.error("Error getting referral code", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const referralEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limiting (prevent referral spam)
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

    const parsed = referralEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Validate email format
    try {
      validateEmail(parsed.data.email);
    } catch {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    await trackReferral(session.user.id, parsed.data.email);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error tracking referral", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

