import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPortalSession } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    const portalSession = await createPortalSession(user.stripeCustomerId);

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    logger.error("Error creating portal session", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
