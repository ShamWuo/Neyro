import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const areaSchema = z.object({
  name: z.string().min(1),
  standard: z.string().min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const areas = await prisma.area.findMany({ where: { userId: session.user.id, archivedAt: null }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(areas);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const parsed = areaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const area = await prisma.area.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      standard: parsed.data.standard,
    },
  });
  return NextResponse.json(area, { status: 201 });
}
