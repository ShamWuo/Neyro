import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";

const settingsSchema = z.object({
  projectLimit: z.number().min(3).max(10).optional(),
  voiceLanguage: z.string().optional(),
  ttsEnabled: z.boolean().optional(),
  personality: z.enum(["strict", "supportive", "balanced"]).optional(),
  reviewDay: z.string().optional(),
  reviewTime: z.string().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  notifications: z.record(z.boolean()).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId: session.user.id, theme: "light" },
      });
    }

    // Always return light theme, regardless of stored value
    return NextResponse.json({ ...settings, theme: "light" });
  } catch (error) {
    logger.error("Error fetching settings", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Always force theme to "light" - ignore any theme changes
    const updateData = { ...parsed.data };
    if ("theme" in updateData) {
      delete updateData.theme;
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        theme: "light",
        ...updateData,
      },
      update: {
        ...updateData,
        theme: "light", // Always set to light
      },
    });

    // Always return light theme
    return NextResponse.json({ ...settings, theme: "light" });
  } catch (error) {
    logger.error("Error updating settings", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
