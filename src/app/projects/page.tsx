import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProjectStatus } from "@prisma/client";

export default async function ProjectsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/auth/login");
    const userId = session.user.id;

    const projects = await prisma.project.findMany({
        where: {
            userId,
            status: ProjectStatus.ACTIVE,
            archivedAt: null
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="container mx-auto py-10 px-6">
            <h1 className="text-3xl font-bold mb-8">Projects</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.length === 0 ? (
                    <p className="text-[var(--text-secondary)]">No active projects. Capture one on the home page.</p>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] shadow-sm">
                            <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
                            <p className="text-sm text-[var(--text-secondary)] mb-4">{project.outcome}</p>
                            {project.deadline && (
                                <div className="text-xs text-[var(--text-tertiary)] bg-[var(--surface-muted)] inline-block px-2 py-1 rounded">
                                    Due: {new Date(project.deadline).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
