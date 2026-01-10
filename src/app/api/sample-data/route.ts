import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const sampleProjects = [
  { name: "Launch Website", outcome: "Live website with core features" },
  { name: "Learn Next.js", outcome: "Complete Next.js course" },
  { name: "Design System", outcome: "Component library documentation" },
];

const sampleAreas = [
  { name: "Health", standard: "Exercise 3x/week, eat balanced meals" },
  { name: "Finances", standard: "Track expenses, save 20% of income" },
  { name: "Relationships", standard: "Connect with friends weekly" },
];

const sampleItems = [
  { title: "Review design mockups", type: "TASK" as const },
  { title: "Schedule team meeting", type: "TASK" as const },
  { title: "Research deployment options", type: "TASK" as const },
  { title: "https://example.com/article", type: "LINK" as const },
  { title: "Important project notes", type: "NOTE" as const },
];

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type = "all" } = body;

    const userId = session.user.id;
    const created = { projects: 0, areas: 0, items: 0 };

    if (type === "all" || type === "project") {
      // Create sample projects
      for (const project of sampleProjects) {
        const existing = await prisma.project.findFirst({
          where: { userId, name: project.name },
        });
        if (!existing) {
          await prisma.project.create({
            data: {
              userId,
              name: project.name,
              outcome: project.outcome,
            },
          });
          created.projects++;
        }
      }
    }

    if (type === "all" || type === "area") {
      // Create sample areas
      for (const area of sampleAreas) {
        const existing = await prisma.area.findFirst({
          where: { userId, name: area.name },
        });
        if (!existing) {
          await prisma.area.create({
            data: {
              userId,
              name: area.name,
              standard: area.standard,
            },
          });
          created.areas++;
        }
      }
    }

    if (type === "all" || type === "item") {
      // Create sample items
      for (const item of sampleItems) {
        await prisma.item.create({
          data: {
            userId,
            title: item.title,
            type: item.type,
            classification: "INBOX",
          },
        });
        created.items++;
      }
    }

    logger.info("Sample data generated", { created, userId });

    const message = `Generated: ${created.projects} projects, ${created.areas} areas, ${created.items} items`;

    return NextResponse.json({ message, created });
  } catch (error) {
    logger.error("Error generating sample data", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to generate sample data" },
      { status: 500 }
    );
  }
}
