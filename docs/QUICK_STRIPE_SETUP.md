# Quick Stripe Setup (5 Minutes)

## What You Need

1. **STRIPE_SECRET_KEY** - From Dashboard → Developers → API keys (starts with `sk_`)
2. **STRIPE_WEBHOOK_SECRET** - From Stripe CLI for local dev (starts with `whsec_`)
3. **STRIPE_PRICE_FOCUS_MONTHLY** - Price ID after creating Focus product (starts with `price_`)
4. **STRIPE_PRICE_BRAIN_TRUST_MONTHLY** - Price ID after creating Brain Trust product (starts with `price_`)

## Quick Steps

### 1. Get API Keys (2 minutes)

Stripe Dashboard → Developers → API keys → Copy:
- **Secret key** (test mode) → `STRIPE_SECRET_KEY`

### 2. Create Products & Get Price IDs (2 minutes)

Stripe Dashboard → Products → Add product:

**Focus Product:**
- Name: `Focus`
- Price: `$18.00` monthly recurring
- Save → Copy Price ID (shown after saving)

**Brain Trust Product:**
- Name: `Brain Trust`  
- Price: `$29.00` monthly recurring
- Save → Copy Price ID (shown after saving)

### 3. Set Up Local Webhook (1 minute)

```bash
stripe login
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

Copy the `whsec_...` secret it outputs → `STRIPE_WEBHOOK_SECRET`

### 4. Add to .env

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_FOCUS_MONTHLY=price_...
STRIPE_PRICE_BRAIN_TRUST_MONTHLY=price_...
```

That's it! 🎉

## Where to Find Price IDs

After creating a price in Stripe:
1. The Price ID is shown **immediately after saving**
2. Or go to: Products → Click product → View prices → Price ID is listed
3. Format: Always `price_` followed by letters/numbers

## Example

If your Price ID is `price_1QwErTyUiOpAsDfGhJkLmNoPqRs`, your .env would be:

```env
STRIPE_PRICE_FOCUS_MONTHLY=price_1QwErTyUiOpAsDfGhJkLmNoPqRs
```

**Important:** Don't use my example - use your actual Price IDs from Stripe!
