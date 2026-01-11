import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getActiveProjectCount } from "@/lib/para";
import { checkSubscriptionLimit } from "@/lib/subscription";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const active = await getActiveProjectCount(userId);
    const limitInfo = await checkSubscriptionLimit(userId, "maxProjects");

    const limit = limitInfo.limit ?? 0;
    const remaining = Math.max(0, limit - (limitInfo.current ?? active));

    return NextResponse.json({ active, limit, remaining, allowed: limitInfo.allowed });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "unknown" }, { status: 500 });
  }
}
