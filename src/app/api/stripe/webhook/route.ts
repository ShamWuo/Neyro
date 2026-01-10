import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, updateSubscriptionFromStripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    logger.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;

        if (userId && tier) {
          // Validate tier is a valid SubscriptionTier
          const validTier: SubscriptionTier = (tier === "FOCUS" || tier === "BRAIN_TRUST" || tier === "FREE")
            ? (tier as SubscriptionTier)
            : ("FREE" as SubscriptionTier);
          
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionTier: validTier,
              subscriptionStatus: SubscriptionStatus.ACTIVE,
            },
          });

          logger.info("Subscription created", { userId, tier });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await updateSubscriptionFromStripe(subscription, event.type);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionTier: "FREE" as SubscriptionTier,
              subscriptionStatus: SubscriptionStatus.CANCELED,
              stripeSubscriptionId: null,
            },
          });

          logger.info("Subscription canceled", { userId });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
        // In webhook events, invoice.subscription is a string ID
        const subscriptionId = typeof invoice.subscription === "string" 
          ? invoice.subscription 
          : (invoice.subscription as Stripe.Subscription | null)?.id || null;
        if (!subscriptionId || !stripe) break;

        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await updateSubscriptionFromStripe(subscription, event.type);
        } catch (err) {
          logger.error("Error retrieving subscription from invoice", err instanceof Error ? err : new Error(String(err)));
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
        // In webhook events, invoice.subscription is a string ID
        const subscriptionId = typeof invoice.subscription === "string" 
          ? invoice.subscription 
          : (invoice.subscription as Stripe.Subscription | null)?.id || null;
        if (!subscriptionId || !stripe) break;

        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await updateSubscriptionFromStripe(subscription, event.type);
        } catch (err) {
          logger.error("Error retrieving subscription from invoice", err instanceof Error ? err : new Error(String(err)));
        }
        break;
      }

      default:
        logger.info("Unhandled webhook event", { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Error processing webhook", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
