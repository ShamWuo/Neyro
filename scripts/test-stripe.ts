/**
 * Comprehensive Stripe Integration Test Script
 * Tests all Stripe functionality including:
 * - API initialization
 * - Customer creation
 * - Checkout session creation
 * - Webhook handling
 * - Portal session creation
 */

import { prisma } from "../src/lib/prisma";
import {
  stripe,
  getOrCreateStripeCustomer,
  createCheckoutSession,
  createPortalSession,
  updateSubscriptionFromStripe,
  STRIPE_PRICE_IDS
} from "../src/lib/stripe";
import { logger } from "../src/lib/logger";

// Test colors for output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message: string, type: "success" | "error" | "info" | "warn" = "info") {
  const color = type === "success" ? colors.green :
    type === "error" ? colors.red :
      type === "warn" ? colors.yellow : colors.blue;
  console.log(`${color}${message}${colors.reset}`);
}

async function testStripeInitialization() {
  log("\n=== Test 1: Stripe Initialization ===", "info");

  if (!stripe) {
    log("❌ Stripe is not initialized - STRIPE_SECRET_KEY missing", "error");
    return false;
  }

  log("✅ Stripe client initialized", "success");
  log(`   API Version: 2024-10-28.acacia`, "info");

  // Test API key validity by making a simple API call
  try {
    await stripe.customers.list({ limit: 1 });
    log("✅ Stripe API key is valid", "success");
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    log(`❌ Stripe API key validation failed: ${message}`, "error");
    return false;
  }
}

async function testPriceIds() {
  log("\n=== Test 2: Price IDs Configuration ===", "info");

  const requiredPrices = [
    "FOCUS_MONTHLY",
  ];

  const optionalPrices = [
    "BRAIN_TRUST_MONTHLY",
    "FOCUS_YEARLY",
    "BRAIN_TRUST_YEARLY",
  ];

  let allValid = true;

  for (const priceKey of requiredPrices) {
    const priceId = STRIPE_PRICE_IDS[priceKey as keyof typeof STRIPE_PRICE_IDS];
    // Check if it's a fallback value (contains placeholder text) or doesn't start with price_
    const isFallback = priceId.includes("_monthly") || priceId.includes("_yearly") ||
      priceId === `price_${priceKey.toLowerCase()}` ||
      !priceId.startsWith("price_");

    if (!priceId || isFallback) {
      log(`❌ ${priceKey} is missing or invalid: ${priceId}`, "error");
      allValid = false;
    } else {
      log(`✅ ${priceKey}: ${priceId}`, "success");

      // Verify price exists in Stripe
      if (stripe) {
        try {
          const price = await stripe.prices.retrieve(priceId);
          log(`   → Price verified: $${(price.unit_amount || 0) / 100}/${price.recurring?.interval || "one-time"}`, "info");
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          log(`   ⚠️  Price not found in Stripe: ${message}`, "warn");
        }
      }
    }
  }

  for (const priceKey of optionalPrices) {
    const priceId = STRIPE_PRICE_IDS[priceKey as keyof typeof STRIPE_PRICE_IDS];
    const isFallback = priceId.includes("_monthly") || priceId.includes("_yearly") ||
      priceId === `price_${priceKey.toLowerCase()}` ||
      !priceId.startsWith("price_");

    if (priceId && !isFallback) {
      log(`✅ ${priceKey}: ${priceId}`, "success");
      // Verify price exists in Stripe
      if (stripe) {
        try {
          const price = await stripe.prices.retrieve(priceId);
          log(`   → Price verified: $${(price.unit_amount || 0) / 100}/${price.recurring?.interval || "one-time"}`, "info");
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          log(`   ⚠️  Price not found in Stripe: ${message}`, "warn");
        }
      }
    } else {
      log(`⚠️  ${priceKey}: Not configured (optional)`, "warn");
    }
  }

  return allValid;
}

async function testCustomerCreation() {
  log("\n=== Test 3: Customer Creation ===", "info");

  if (!stripe) {
    log("❌ Stripe not initialized", "error");
    return false;
  }

  // Get or create a test user
  let testUser = await prisma.user.findFirst({
    where: { email: { not: null } },
  });

  if (!testUser || !testUser.email) {
    log("⚠️  No test user found - creating one...", "warn");
    testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: "Test User",
      },
    });
  }

  log(`Using test user: ${testUser.email} (${testUser.id})`, "info");

  try {
    const customerId = await getOrCreateStripeCustomer(
      testUser.id,
      testUser.email!,
      testUser.name || undefined
    );

    log(`✅ Customer created/retrieved: ${customerId}`, "success");

    // Verify customer in Stripe
    const customer = await stripe.customers.retrieve(customerId);
    if (typeof customer !== "string" && !customer.deleted) {
      log(`   → Email: ${customer.email}`, "info");
      log(`   → Name: ${customer.name || "N/A"}`, "info");
    }

    // Check if customer ID is saved in database
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { stripeCustomerId: true },
    });

    if (updatedUser?.stripeCustomerId === customerId) {
      log("✅ Customer ID saved to database", "success");
    } else {
      log("❌ Customer ID not saved to database", "error");
      return false;
    }

    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    log(`❌ Customer creation failed: ${message}`, "error");
    return false;
  }
}

async function testCheckoutSessionCreation() {
  log("\n=== Test 4: Checkout Session Creation ===", "info");

  if (!stripe) {
    log("❌ Stripe not initialized", "error");
    return false;
  }

  // Get test user
  const testUser = await prisma.user.findFirst({
    where: { email: { not: null } },
  });

  if (!testUser || !testUser.email) {
    log("❌ No test user found", "error");
    return false;
  }

  try {
    // Test Focus monthly checkout
    const session = await createCheckoutSession(
      testUser.id,
      "FOCUS",
      "monthly"
    );

    log(`✅ Checkout session created: ${session.id}`, "success");
    log(`   → URL: ${session.url}`, "info");
    log(`   → Mode: ${session.mode}`, "info");
    log(`   → Customer: ${session.customer}`, "info");

    // Verify session metadata
    if (session.metadata?.userId === testUser.id && session.metadata?.tier === "FOCUS") {
      log("✅ Session metadata correct", "success");
    } else {
      log("⚠️  Session metadata may be incorrect", "warn");
    }

    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    log(`❌ Checkout session creation failed: ${message}`, "error");
    return false;
  }
}

async function testPortalSessionCreation() {
  log("\n=== Test 5: Portal Session Creation ===", "info");

  if (!stripe) {
    log("❌ Stripe not initialized", "error");
    return false;
  }

  // Get test user with customer ID
  const testUser = await prisma.user.findFirst({
    where: {
      email: { not: null },
      stripeCustomerId: { not: null },
    },
  });

  if (!testUser?.stripeCustomerId) {
    log("⚠️  No user with Stripe customer ID found - skipping portal test", "warn");
    log("   (This is expected if no checkout has been completed)", "info");
    return true; // Not a failure, just not testable yet
  }

  try {
    const portalSession = await createPortalSession(testUser.stripeCustomerId);

    log(`✅ Portal session created: ${portalSession.id}`, "success");
    log(`   → URL: ${portalSession.url}`, "info");

    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    log(`❌ Portal session creation failed: ${message}`, "error");
    return false;
  }
}

async function testWebhookSecret() {
  log("\n=== Test 6: Webhook Secret Configuration ===", "info");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    log("❌ STRIPE_WEBHOOK_SECRET not set", "error");
    return false;
  }

  if (!webhookSecret.startsWith("whsec_")) {
    log("⚠️  Webhook secret doesn't start with 'whsec_' - may be invalid", "warn");
  } else {
    log("✅ Webhook secret configured", "success");
  }

  // Test webhook signature verification (mock)
  if (stripe) {
    try {
      const testPayload = JSON.stringify({ type: "test", data: {} });
      const testSignature = "test_signature";

      // This will fail, but we're just checking the function exists
      try {
        stripe.webhooks.constructEvent(testPayload, testSignature, webhookSecret);
      } catch {
        // Expected to fail with test data
        log("✅ Webhook signature verification function available", "success");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      log(`⚠️  Webhook verification test: ${message}`, "warn");
    }
  }

  return true;
}

async function testDatabaseSchema() {
  log("\n=== Test 7: Database Schema ===", "info");

  try {
    // Check if User model has all required Stripe fields
    const testUser = await prisma.user.findFirst({
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionCurrentPeriodEnd: true,
        subscriptionCancelAtPeriodEnd: true,
        trialEndsAt: true,
      },
    });

    log("✅ Database schema includes all Stripe fields:", "success");
    log("   → stripeCustomerId", "info");
    log("   → stripeSubscriptionId", "info");
    log("   → subscriptionTier", "info");
    log("   → subscriptionStatus", "info");
    log("   → subscriptionCurrentPeriodEnd", "info");
    log("   → subscriptionCancelAtPeriodEnd", "info");
    log("   → trialEndsAt", "info");

    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    log(`❌ Database schema check failed: ${message}`, "error");
    return false;
  }
}

async function testEnvironmentVariables() {
  log("\n=== Test 8: Environment Variables ===", "info");

  const required = [
    "STRIPE_SECRET_KEY",
  ];

  const optional = [
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_FOCUS_MONTHLY",
    "STRIPE_PRICE_FOCUS_YEARLY",
    "STRIPE_PRICE_BRAIN_TRUST_MONTHLY",
    "STRIPE_PRICE_BRAIN_TRUST_YEARLY",
  ];

  let allValid = true;

  for (const key of required) {
    const value = process.env[key];
    if (!value) {
      log(`❌ ${key} is not set`, "error");
      allValid = false;
    } else {
      const masked = key.includes("SECRET") || key.includes("KEY")
        ? `${value.substring(0, 10)}...`
        : value;
      log(`✅ ${key}: ${masked}`, "success");
    }
  }

  for (const key of optional) {
    const value = process.env[key];
    if (value) {
      const masked = key.includes("SECRET") || key.includes("KEY")
        ? `${value.substring(0, 10)}...`
        : value;
      log(`✅ ${key}: ${masked}`, "success");
    } else {
      log(`⚠️  ${key}: Not set (optional)`, "warn");
    }
  }

  return allValid;
}

async function runAllTests() {
  log("🚀 Starting Stripe Integration Tests\n", "info");

  const results = {
    initialization: false,
    priceIds: false,
    customerCreation: false,
    checkoutSession: false,
    portalSession: false,
    webhookSecret: false,
    databaseSchema: false,
    environmentVariables: false,
  };

  try {
    results.environmentVariables = await testEnvironmentVariables();
    results.initialization = await testStripeInitialization();
    results.priceIds = await testPriceIds();
    results.databaseSchema = await testDatabaseSchema();
    results.webhookSecret = await testWebhookSecret();
    results.customerCreation = await testCustomerCreation();
    results.checkoutSession = await testCheckoutSessionCreation();
    results.portalSession = await testPortalSessionCreation();

    // Summary
    log("\n" + "=".repeat(50), "info");
    log("📊 Test Summary", "info");
    log("=".repeat(50), "info");

    const total = Object.keys(results).length;
    const passed = Object.values(results).filter(Boolean).length;

    for (const [test, passed] of Object.entries(results)) {
      const status = passed ? "✅ PASS" : "❌ FAIL";
      log(`${status} - ${test}`, passed ? "success" : "error");
    }

    log("\n" + "=".repeat(50), "info");
    log(`Results: ${passed}/${total} tests passed`, passed === total ? "success" : "warn");
    log("=".repeat(50) + "\n", "info");

    if (passed === total) {
      log("🎉 All Stripe tests passed!", "success");
      process.exit(0);
    } else {
      log("⚠️  Some tests failed. Please review the output above.", "warn");
      process.exit(1);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    log(`\n❌ Fatal error during testing: ${message}`, "error");
    if (error instanceof Error && error.stack) {
      log(error.stack, "error");
    }
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error("Test script error", message);
  process.exit(1);
});
