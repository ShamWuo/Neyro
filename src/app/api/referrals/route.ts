import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateReferralCode, trackReferral } from "@/lib/referral";
import { logger } from "@/lib/logger";
import { z } from "zod";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const code = await generateReferralCode(session.user.id);
    const referralUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/signup?ref=${code}`;

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

    await trackReferral(session.user.id, parsed.data.email);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error tracking referral", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

