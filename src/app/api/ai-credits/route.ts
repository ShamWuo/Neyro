import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAICreditUsage } from "@/lib/ai-credits";
import { logger } from "@/lib/logger";
import { isAllowed } from "@/lib/rate-limiter";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting (prevent abuse of credit checking)
    try {
      const allowed = await isAllowed(`user:${session.user.id}`, 10, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
       
      console.warn("Rate limiter check failed, allowing ai-credits request:", (e as Error)?.message || String(e));
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
