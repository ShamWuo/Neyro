import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/security";
import { env } from "@/lib/env";
import { getLimiterStatus } from "@/lib/rate-limiter";

export const runtime = "nodejs";

export async function GET(request: Request) {
  // Require auth
  try {
    const session = await requireAuth();
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    // In production, only allow if ADMIN_ALLOW env var is set to 'true'
    if (env.NODE_ENV === "production" && process.env.ADMIN_ALLOW !== "true") {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    const status = await getLimiterStatus();
    return new NextResponse(JSON.stringify({ ok: true, status }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(JSON.stringify({ error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
