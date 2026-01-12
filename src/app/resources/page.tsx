import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ResourcesPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/auth/login");
    const userId = session.user.id;

    const collections = await prisma.resourceCollection.findMany({
        where: {
            userId,
            archivedAt: null
        },
        orderBy: { name: "asc" }
    });

    return (
        <div className="container mx-auto py-10 px-6">
            <h1 className="text-3xl font-bold mb-8">Resources</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {collections.length === 0 ? (
                    <p className="text-[var(--text-secondary)]">No resources. Capture one on the home page.</p>
                ) : (
                    collections.map((col) => (
                        <div key={col.id} className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] shadow-sm">
                            <h2 className="text-xl font-semibold mb-2">{col.name}</h2>
                            <div className="text-xs text-[var(--text-tertiary)]">
                                Resource Collection
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
