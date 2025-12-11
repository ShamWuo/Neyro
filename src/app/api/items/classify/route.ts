import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { classifyItem } from "@/lib/para";
import { ItemClassification } from "@prisma/client";
import { z } from "zod";

const classifySchema = z.object({
  itemId: z.string().min(1),
  classification: z.nativeEnum(ItemClassification),
  projectId: z.string().optional(),
  areaId: z.string().optional(),
  resourceCollectionId: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const parsed = classifySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await classifyItem({
    itemId: parsed.data.itemId,
    userId: session.user.id,
    classification: parsed.data.classification,
    projectId: parsed.data.projectId,
    areaId: parsed.data.areaId,
    resourceCollectionId: parsed.data.resourceCollectionId,
  });

  return NextResponse.json({ ok: true });
}
