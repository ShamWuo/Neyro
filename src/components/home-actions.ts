"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { analyzeParaCaptureSafe } from "@/lib/ai-safe";
import { createProjectWithLimit, ensureProjectLimit } from "@/lib/para";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function saveClassifiedItem(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    const text = String(formData.get("details") || "");
    if (!text.trim()) return;

    try {
        // 1. Analyze with AI
        const analysis = await analyzeParaCaptureSafe({ text });

        // 2. Route based on classification
        if (analysis.classification === ItemClassification.PROJECT) {
            await ensureProjectLimit(userId);
            await createProjectWithLimit(userId, {
                name: analysis.title,
                outcome: analysis.details || "Generated from capture",
                status: ProjectStatus.ACTIVE,
                userId,
            });
            return redirect("/projects");
        }
        else if (analysis.classification === ItemClassification.AREA) {
            await prisma.area.create({
                data: {
                    userId,
                    name: analysis.title,
                    standard: analysis.details || "Generated from capture",
                }
            });
            return redirect("/areas");
        }
        else if (analysis.classification === ItemClassification.RESOURCE) {
            await prisma.resourceCollection.create({
                data: {
                    userId,
                    name: analysis.title,
                }
            });
            return redirect("/resources");
        }
        else {
            // Fallback or other handling
        }

        revalidatePath("/");
    } catch (e) {
        console.error("Capture failed", e);
    }
}
