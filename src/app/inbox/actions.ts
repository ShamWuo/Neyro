"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ItemType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function saveInboxItem(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    const title = String(formData.get("title") || "Untitled");
    const text = String(formData.get("text") || ""); // capture-plus sends 'text', others might send 'details'
    const details = String(formData.get("details") || text);

    await prisma.item.create({
        data: {
            userId,
            title,
            details,
            classification: ItemClassification.INBOX,
            type: ItemType.NOTE,
        },
    });

    revalidatePath("/inbox");
    revalidatePath("/");
}
