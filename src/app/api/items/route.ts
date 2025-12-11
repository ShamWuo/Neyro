import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  details: z.string().optional(),
  url: z.string().url().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.item.findMany({
    where: { userId: session.user.id, classification: ItemClassification.INBOX, archivedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const item = await prisma.item.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      details: parsed.data.details,
      url: parsed.data.url,
      classification: ItemClassification.INBOX,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
