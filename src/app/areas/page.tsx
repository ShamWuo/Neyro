import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AreasPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/auth/login");
    const userId = session.user.id;

    const areas = await prisma.area.findMany({
        where: {
            userId,
            archivedAt: null
        },
        orderBy: { name: "asc" }
    });

    return (
        <div className="container mx-auto py-10 px-6">
            <h1 className="text-3xl font-bold mb-8">Areas</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {areas.length === 0 ? (
                    <p className="text-[var(--text-secondary)]">No areas defined. Capture one on the home page.</p>
                ) : (
                    areas.map((area) => (
                        <div key={area.id} className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] shadow-sm">
                            <h2 className="text-xl font-semibold mb-2">{area.name}</h2>
                            {area.standard && (
                                <p className="text-sm text-[var(--text-secondary)]">Standard: {area.standard}</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
