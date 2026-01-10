import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import { z } from "zod";

const checkoutSchema = z.object({
  tier: z.enum(["FOCUS", "BRAIN_TRUST"]),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const checkoutSession = await createCheckoutSession(
      session.user.id,
      parsed.data.tier,
      parsed.data.billingCycle
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    logger.error("Error creating checkout session", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
