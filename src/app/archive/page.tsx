import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ItemClassification } from "@prisma/client";

export default async function ArchivePage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/auth/login");
    const userId = session.user.id;

    const items = await prisma.item.findMany({
        where: {
            userId,
            classification: ItemClassification.ARCHIVE
        },
        orderBy: { archivedAt: "desc" },
        take: 50
    });

    return (
        <div className="container mx-auto py-10 px-6">
            <h1 className="text-3xl font-bold mb-8">Archive</h1>
            <div className="space-y-4">
                {items.length === 0 ? (
                    <p className="text-[var(--text-secondary)]">Archive is empty.</p>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] opacity-75">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{item.title}</span>
                                <span className="text-xs text-[var(--text-tertiary)]">
                                    {item.archivedAt ? new Date(item.archivedAt).toLocaleDateString() : "Archived"}
                                </span>
                            </div>
                            {item.details && <p className="text-sm text-[var(--text-secondary)] mt-1">{item.details}</p>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
