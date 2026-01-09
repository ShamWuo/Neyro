import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = emailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const { email } = parsed.data;

    // TODO: Integrate with your newsletter service (Mailchimp, ConvertKit, etc.)
    // Example with a placeholder:
    // try {
    //   await fetch('https://api.mailchimp.com/3.0/lists/{list-id}/members', {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       email_address: email,
    //       status: 'subscribed',
    //     }),
    //   });
    // } catch (serviceError) {
    //   logger.error("Newsletter service error", serviceError);
    //   return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    // }

    // For now, just log it (replace with actual integration)
    logger.info("Newsletter signup", { email });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Newsletter signup error", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}

