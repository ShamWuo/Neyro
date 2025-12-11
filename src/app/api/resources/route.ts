import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const collectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const collections = await prisma.resourceCollection.findMany({ where: { userId: session.user.id, archivedAt: null }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(collections);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const parsed = collectionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const collection = await prisma.resourceCollection.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description,
    },
  });
  return NextResponse.json(collection, { status: 201 });
}
