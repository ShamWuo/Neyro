import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getActiveProjectCount, MAX_ACTIVE_PROJECTS } from "@/lib/para";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const active = await getActiveProjectCount(userId);
    const limit = MAX_ACTIVE_PROJECTS;
    const remaining = Math.max(0, limit - active);
    const allowed = active < limit;

    return NextResponse.json({ active, limit, remaining, allowed });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "unknown" }, { status: 500 });
  }
}
