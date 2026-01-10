import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAICreditUsage } from "@/lib/ai-credits";
import { logger } from "@/lib/logger";
import { takeToken } from "@/lib/rateLimiter";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting (prevent abuse of credit checking)
    try {
      takeToken(`user:${session.user.id}`);
    } catch {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const usage = await getAICreditUsage(session.user.id);

    return NextResponse.json(usage);
  } catch (error) {
    logger.error("Error fetching AI credit usage", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to fetch credit usage" },
      { status: 500 }
    );
  }
}
