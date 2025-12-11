import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureProjectLimit } from "@/lib/para";
import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  outcome: z.string().min(1).optional(),
  deadline: z.string().datetime().nullable().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  archive: z.boolean().optional(),
});

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await _req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { id } = await params;

  const project = await prisma.project.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.status === ProjectStatus.ACTIVE && project.status !== ProjectStatus.ACTIVE) {
    await ensureProjectLimit(session.user.id);
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      name: parsed.data.name ?? project.name,
      outcome: parsed.data.outcome ?? project.outcome,
      deadline: parsed.data.deadline === undefined ? project.deadline : parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      status: parsed.data.status ?? project.status,
      archivedAt: parsed.data.archive ? new Date() : project.archivedAt,
    },
  });
  return NextResponse.json(updated);
}
