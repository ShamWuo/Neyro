import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureProjectLimit } from "@/lib/para";
import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(1),
  outcome: z.string().min(1),
  deadline: z.string().datetime().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const projects = await prisma.project.findMany({
    where: { userId: session.user.id, archivedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const desiredStatus = parsed.data.status ?? ProjectStatus.ACTIVE;
  if (desiredStatus === ProjectStatus.ACTIVE) {
    await ensureProjectLimit(session.user.id);
  }

  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      outcome: parsed.data.outcome,
      status: desiredStatus,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
    },
  });
  return NextResponse.json(project, { status: 201 });
}
