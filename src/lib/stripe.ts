import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";

// Only instantiate Stripe if we have a secret key
// In test environment, Stripe package is mocked in jest.setup.js
const isTest = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined;

if (!process.env.STRIPE_SECRET_KEY && !isTest) {
  logger.warn("STRIPE_SECRET_KEY not set - Stripe features will be disabled");
}

// In test mode, stripe will be the mocked instance
// In production, only create if STRIPE_SECRET_KEY is set
export const stripe = (isTest || process.env.STRIPE_SECRET_KEY)
  ? new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    })
  : null;

// Stripe price IDs - set these in your Stripe dashboard
export const STRIPE_PRICE_IDS = {
  FOCUS_MONTHLY: process.env.STRIPE_PRICE_FOCUS_MONTHLY || "price_focus_monthly",
  FOCUS_YEARLY: process.env.STRIPE_PRICE_FOCUS_YEARLY || "price_focus_yearly",
  BRAIN_TRUST_MONTHLY: process.env.STRIPE_PRICE_BRAIN_TRUST_MONTHLY || "price_brain_trust_monthly",
  BRAIN_TRUST_YEARLY: process.env.STRIPE_PRICE_BRAIN_TRUST_YEARLY || "price_brain_trust_yearly",
};

export async function getOrCreateStripeCustomer(userId: string, email: string, name?: string | null) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createCheckoutSession(
  userId: string,
  tier: "FOCUS" | "BRAIN_TRUST",
  billingCycle: "monthly" | "yearly" = "monthly"
) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user?.email) {
    throw new Error("User email is required");
  }

  const customerId = await getOrCreateStripeCustomer(userId, user.email, user.name);

  const priceId =
    billingCycle === "monthly"
      ? tier === "FOCUS"
        ? STRIPE_PRICE_IDS.FOCUS_MONTHLY
        : STRIPE_PRICE_IDS.BRAIN_TRUST_MONTHLY
      : tier === "FOCUS"
        ? STRIPE_PRICE_IDS.FOCUS_YEARLY
        : STRIPE_PRICE_IDS.BRAIN_TRUST_YEARLY;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/settings/billing?canceled=true`,
    metadata: {
      userId,
      tier,
    },
    subscription_data: {
      metadata: {
        userId,
        tier,
      },
    },
  });

  return session;
}

export async function createPortalSession(customerId: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/settings/billing`,
  });

  return session;
}

export async function updateSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  eventType: string
) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    logger.warn("Subscription missing userId metadata", { subscriptionId: subscription.id });
    return;
  }

  const tier = subscription.metadata?.tier as SubscriptionTier | undefined;
  const status = subscription.status;

  let subscriptionStatus: SubscriptionStatus;
  if (status === "active") {
    subscriptionStatus = SubscriptionStatus.ACTIVE;
  } else if (status === "canceled") {
    subscriptionStatus = SubscriptionStatus.CANCELED;
  } else if (status === "past_due") {
    subscriptionStatus = SubscriptionStatus.PAST_DUE;
  } else if (status === "trialing") {
    subscriptionStatus = SubscriptionStatus.TRIALING;
  } else {
    subscriptionStatus = SubscriptionStatus.INCOMPLETE;
  }

  // Type assertion for Stripe subscription properties that may not be in the strict type
  const subscriptionData = subscription as Stripe.Subscription & {
    current_period_end?: number;
    cancel_at_period_end?: boolean;
  };

  const updateData: {
    subscriptionTier?: SubscriptionTier;
    subscriptionStatus?: SubscriptionStatus;
    subscriptionCurrentPeriodEnd?: Date;
    subscriptionCancelAtPeriodEnd?: boolean;
    stripeSubscriptionId?: string;
  } = {
    subscriptionStatus,
    subscriptionCurrentPeriodEnd: subscriptionData.current_period_end
      ? new Date(subscriptionData.current_period_end * 1000)
      : undefined,
    subscriptionCancelAtPeriodEnd: subscriptionData.cancel_at_period_end === true,
    stripeSubscriptionId: subscription.id,
  };

  if (tier && (tier === "FOCUS" || tier === "BRAIN_TRUST")) {
    updateData.subscriptionTier = tier as SubscriptionTier;
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  logger.info("Updated subscription from Stripe webhook", {
    userId,
    tier,
    status,
    eventType,
  });
}
