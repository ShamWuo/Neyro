import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification } from "@prisma/client";

export const runtime = "nodejs";

// Export user data as JSON or CSV
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";

  try {
    const [items, projects, areas, collections, reviews] = await Promise.all([
      prisma.item.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.project.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.area.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.resourceCollection.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.weeklyReview.findMany({ where: { userId }, orderBy: { completedAt: "desc" } }),
    ]);

    const data = {
      exportDate: new Date().toISOString(),
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      items,
      projects,
      areas,
      collections,
      reviews,
      stats: {
        totalItems: items.length,
        inboxItems: items.filter((i) => i.classification === ItemClassification.INBOX && !i.archivedAt).length,
        activeProjects: projects.filter((p) => p.status === "ACTIVE" && !p.archivedAt).length,
        totalAreas: areas.filter((a) => !a.archivedAt).length,
        totalCollections: collections.filter((c) => !c.archivedAt).length,
        totalReviews: reviews.length,
      },
    };

    if (format === "csv") {
      // Convert to CSV format
      const csvRows: string[] = [];
      
      // Items CSV
      csvRows.push("Type,Title,Classification,Status,Created,Updated");
      items.forEach((item) => {
        csvRows.push(
          `"Item","${item.title.replace(/"/g, '""')}","${item.classification}","${item.isDone ? "Done" : "Active"}","${item.createdAt.toISOString()}","${item.updatedAt.toISOString()}"`
        );
      });

      // Projects CSV
      csvRows.push("\nType,Name,Status,Outcome,Created,Updated");
      projects.forEach((project) => {
        csvRows.push(
          `"Project","${project.name.replace(/"/g, '""')}","${project.status}","${project.outcome.replace(/"/g, '""')}","${project.createdAt.toISOString()}","${project.updatedAt.toISOString()}"`
        );
      });

      return new NextResponse(csvRows.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="neyro-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // JSON format (default)
    return NextResponse.json(data, {
      headers: {
        "Content-Disposition": `attachment; filename="neyro-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

