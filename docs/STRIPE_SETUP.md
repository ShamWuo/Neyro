# Stripe Setup Guide

## 1. Create Stripe Account

1. Go to https://stripe.com and create an account
2. Get your API keys from the Dashboard → Developers → API keys
3. Copy your **Secret key** (starts with `sk_`)

## 2. Create Subscription Products

1. Go to Stripe Dashboard → Products
2. Create two products:

### Focus Plan
- Name: "Focus"
- Description: "Full PARA enforcement"
- Pricing:
  - Monthly: $18/month (recurring)
  - Yearly: $180/year (recurring, save 2 months)

### Brain Trust Plan
- Name: "Brain Trust"
- Description: "For teams enforcing PARA"
- Pricing:
  - Monthly: $29/month (recurring)
  - Yearly: $290/year (recurring, save 2 months)

3. Copy the **Price IDs** (start with `price_`) for each plan

## 3. Set Up Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/stripe/webhook`
   - For local dev: Use Stripe CLI (see below)
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

## 4. Environment Variables

Add to your `.env` file:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (from Stripe dashboard)
STRIPE_PRICE_FOCUS_MONTHLY=price_...
STRIPE_PRICE_FOCUS_YEARLY=price_...
STRIPE_PRICE_BRAIN_TRUST_MONTHLY=price_...
STRIPE_PRICE_BRAIN_TRUST_YEARLY=price_...
```

## 5. Local Development with Stripe CLI

For local webhook testing:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3001/api/stripe/webhook`
4. Copy the webhook signing secret it gives you
5. Use that in your `.env` for `STRIPE_WEBHOOK_SECRET`

## 6. Run Database Migration

After updating the Prisma schema:

```bash
npx prisma migrate dev --name add_subscriptions
npx prisma generate
```

## 7. Test the Integration

1. Start your dev server: `npm run dev`
2. Go to `/settings/billing`
3. Click "Upgrade to Focus"
4. Use Stripe test card: `4242 4242 4242 4242`
5. Any future expiry date, any CVC
6. Check webhook events in Stripe Dashboard

## 8. Production Checklist

- [ ] Switch to live API keys
- [ ] Update webhook URL to production domain
- [ ] Test full checkout flow
- [ ] Test subscription cancellation
- [ ] Test subscription renewal
- [ ] Set up email receipts in Stripe
- [ ] Configure tax collection (if needed)
