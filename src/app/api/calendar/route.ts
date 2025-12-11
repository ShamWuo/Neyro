import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function formatDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
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
    lines.push(`UID:${p.name}-${p.deadline.toISOString()}`);
    lines.push(`DTSTAMP:${formatDate(new Date())}`);
    lines.push(`DTSTART;VALUE=DATE:${p.deadline.toISOString().slice(0,10).replace(/-/g, "")}`);
    lines.push(`DTEND;VALUE=DATE:${p.deadline.toISOString().slice(0,10).replace(/-/g, "")}`);
    lines.push(`SUMMARY:${p.name}`);
    if (p.outcome) lines.push(`DESCRIPTION:${p.outcome}`);
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return new NextResponse(lines.join("\r\n"), {
    status: 200,
    headers: { "Content-Type": "text/calendar" },
  });
}
