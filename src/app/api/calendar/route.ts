import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { isAllowed } from "@/lib/rate-limiter";
import { logger } from "@/lib/logger";

function formatDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

// Escape iCal text content (prevent injection)
function escapeIcal(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
    .slice(0, 2000); // Limit length
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Rate limiting (prevent abuse of calendar export)
    try {
      const allowed = await isAllowed(`user:${session.user.id}`, 6, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Rate limiter check failed, allowing calendar request:", e?.message || e);
    }

    const userId = session.user.id;
    const projects = await prisma.project.findMany({ where: { userId, archivedAt: null, deadline: { not: null } }, select: { name: true, outcome: true, deadline: true } });
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Neyro//Calendar Export//EN",
    ];
    projects.forEach((p) => {
      if (!p.deadline) return;
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${escapeIcal(p.name)}-${p.deadline.toISOString()}`);
      lines.push(`DTSTAMP:${formatDate(new Date())}`);
      lines.push(`DTSTART;VALUE=DATE:${p.deadline.toISOString().slice(0,10).replace(/-/g, "")}`);
      lines.push(`DTEND;VALUE=DATE:${p.deadline.toISOString().slice(0,10).replace(/-/g, "")}`);
      lines.push(`SUMMARY:${escapeIcal(p.name)}`);
      if (p.outcome) lines.push(`DESCRIPTION:${escapeIcal(p.outcome)}`);
      lines.push("END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return new NextResponse(lines.join("\r\n"), {
      status: 200,
      headers: { "Content-Type": "text/calendar; charset=utf-8" },
    });
  } catch (error) {
    logger.error("Error generating calendar", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
