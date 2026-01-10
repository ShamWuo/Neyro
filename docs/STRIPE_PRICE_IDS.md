# How to Get Stripe Price IDs

## What Are Price IDs?

Price IDs (like `price_1234567890abcdef`) are **not secrets** - they're public identifiers that Stripe creates when you create a product with pricing. You need to create the products first, then copy the Price IDs.

## Step-by-Step Guide

### Step 1: Create Products in Stripe Dashboard

1. Go to **Stripe Dashboard** → **Products** → **Add product**

#### Product 1: Focus

**Basic Information:**
- **Name**: `Focus`
- **Description**: `Full PARA enforcement`

**Pricing:**
- Click **Add price**
- **Price**: `$18.00`
- **Currency**: `USD`
- **Billing period**: `Monthly` (recurring)
- Click **Save price**

**Copy the Price ID:**
- After saving, you'll see the price listed
- The **Price ID** will be shown (starts with `price_...`)
- Example: `price_1AbCdEfGhIjKlMnO`
- **Copy this** - this is your `STRIPE_PRICE_FOCUS_MONTHLY`

#### Product 2: Brain Trust

**Basic Information:**
- **Name**: `Brain Trust`
- **Description**: `For teams enforcing PARA`

**Pricing:**
- Click **Add price**
- **Price**: `$29.00`
- **Currency**: `USD`
- **Billing period**: `Monthly` (recurring)
- Click **Save price**

**Copy the Price ID:**
- The **Price ID** will be shown (starts with `price_...`)
- Example: `price_1XyZaBcDeFgHiJk`
- **Copy this** - this is your `STRIPE_PRICE_BRAIN_TRUST_MONTHLY`

### Step 2: Optional - Add Yearly Prices

For yearly billing (save 2 months):

#### Focus Yearly
- Same product (`Focus`)
- Click **Add price**
- **Price**: `$180.00` (18 * 10 months)
- **Currency**: `USD`
- **Billing period**: `Yearly` (recurring)
- Copy the Price ID → `STRIPE_PRICE_FOCUS_YEARLY`

#### Brain Trust Yearly
- Same product (`Brain Trust`)
- Click **Add price**
- **Price**: `$290.00` (29 * 10 months)
- **Currency**: `USD`
- **Billing period**: `Yearly` (recurring)
- Copy the Price ID → `STRIPE_PRICE_BRAIN_TRUST_YEARLY`

### Step 3: Add to Your .env File

Once you have the Price IDs, add them to your `.env`:

```env
# Stripe Price IDs (NOT secrets - public identifiers)
STRIPE_PRICE_FOCUS_MONTHLY=price_1AbCdEfGhIjKlMnO
STRIPE_PRICE_FOCUS_YEARLY=price_1XyZaBcDeFgHiJk
STRIPE_PRICE_BRAIN_TRUST_MONTHLY=price_1AbCdEfGhIjKlMnO
STRIPE_PRICE_BRAIN_TRUST_YEARLY=price_1XyZaBcDeFgHiJk
```

**Important:** Replace `price_1AbCdEfGhIjKlMnO` etc. with your **actual** Price IDs from Stripe.

## How to Find Price IDs

After creating prices, you can find them:

1. **In Product Page:**
   - Go to Products → Click on product name
   - Prices are listed with their IDs shown

2. **Via Stripe CLI:**
   ```bash
   stripe prices list
   ```
   - Lists all prices with their IDs

3. **In API Response:**
   - If creating via API, the Price ID is in the response

## Example .env Setup

```env
# Stripe API Keys (these ARE secrets)
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnO...
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...

# Stripe Price IDs (public identifiers - NOT secrets)
STRIPE_PRICE_FOCUS_MONTHLY=price_1AbCdEfGhIjKlMnO
STRIPE_PRICE_FOCUS_YEARLY=price_1XyZaBcDeFgHiJk
STRIPE_PRICE_BRAIN_TRUST_MONTHLY=price_1QwErTyUiOpAsDf
STRIPE_PRICE_BRAIN_TRUST_YEARLY=price_1GhJkLmNoPqRsTu
```

## Quick Test

After adding Price IDs, test:

1. Start your dev server: `npm run dev`
2. Go to `/settings/billing`
3. Click "Upgrade to Focus"
4. Use test card: `4242 4242 4242 4242`
5. Check that checkout works

## Need Help?

If you can't find the Price ID:
1. Make sure the price is **saved** (not just created)
2. Check the product detail page in Stripe Dashboard
3. The Price ID is usually visible next to the price amount
4. Format: Always starts with `price_` followed by alphanumeric characters
