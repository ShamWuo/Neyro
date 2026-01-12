import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { LoadingState } from "@/components/loading-state";

// Code splitting: Load Kanban board dynamically (interactive component)
const KanbanBoard = dynamic(
  () => import("@/components/kanban-board").then((mod) => ({ default: mod.KanbanBoard })),
  {
    loading: () => <LoadingState type="card" />,
    // ssr: true by default for server components
  }
);

export default async function ProjectKanbanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id, userId },
    include: {
      items: {
        where: { classification: ItemClassification.PROJECT },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) redirect("/projects");

  // Calculate date threshold once to avoid calling Date.now() multiple times
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const columns = [
    { id: "todo", title: "To Do", items: project.items.filter((i) => !i.isDone && !i.dueDate) },
    { id: "due", title: "Due Soon", items: project.items.filter((i) => !i.isDone && i.dueDate && new Date(i.dueDate) <= sevenDaysFromNow) },
    { id: "in-progress", title: "In Progress", items: project.items.filter((i) => !i.isDone && i.dueDate && new Date(i.dueDate) > sevenDaysFromNow) },
    { id: "done", title: "Done", items: project.items.filter((i) => i.isDone) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/projects/${id}`} className="text-sm text-[var(--text-secondary)] hover:underline">
            ← Back to project
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name} - Kanban</h1>
        </div>
      </div>

      <KanbanBoard columns={columns} projectId={id} />
    </div>
  );
}

