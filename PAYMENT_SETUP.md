# Payment & Affiliate System Setup Guide

This guide will help you set up the payment and affiliate system for Abdu Academy.

## Prerequisites

1. **Appwrite Account**: You have an Appwrite account (as mentioned)
2. **Stripe Account**: You have a Stripe account with API keys
3. **Environment Variables**: Set up your `.env.local` file

## Step 1: Environment Variables

Create a `.env.local` file in the project root with the following:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 2: Set Up Appwrite

1. **Create a Database** in your Appwrite console
   - Go to your Appwrite project
   - Create a new database (or use default)
   - Note the Database ID

2. **Update Database ID** in `lib/appwrite/config.ts`:
   ```typescript
   export const DATABASE_ID = 'your-database-id';
   ```

3. **Run the Setup Script**:
   ```bash
   pnpm setup:appwrite
   ```
   
   This will create all required collections, attributes, indexes, and a default product.

## Step 3: Set Up Stripe Webhook

### Option A: Local Testing (Recommended for Development)

1. **Install Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```
   This will open your browser to authenticate.

3. **Start Webhook Forwarding**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   
   This command will:
   - Forward all Stripe webhook events to your local server
   - Display a webhook signing secret (starts with `whsec_`)
   - Keep running until you stop it (Ctrl+C)

4. **Copy the Webhook Secret**:
   - The CLI will output something like: `Ready! Your webhook signing secret is whsec_xxxxx`
   - Copy this secret and add it to your `.env.local`:
     ```env
     STRIPE_WEBHOOK_SECRET=whsec_xxxxx
     ```

5. **Keep the CLI Running**:
   - Keep the `stripe listen` command running in a separate terminal
   - Start your Next.js dev server in another terminal: `pnpm dev`
   - Now all webhook events will be forwarded to your local server!

### Option B: Production Webhook (For Deployment)

1. **Deploy your app** to production (Vercel, etc.)

2. **Add Webhook Endpoint in Stripe Dashboard**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - Enter: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook signing secret
   - Add to your production environment variables

**Note**: For local development, always use Option A (Stripe CLI). It's much easier and doesn't require deploying!

## Step 4: Create Admin User

1. Register a user through the app (`/register`)
2. In Appwrite console, manually set that user's `role` field to `'admin'` in the `users` collection
3. Or update the user document programmatically

## Step 5: Test the System

### Test Payment Flow:
1. Go to `/payment`
2. Enter email and optional affiliate code
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify access is granted

### Test Affiliate System:
1. Login as a user
2. Go to `/account` → Affiliate tab
3. Create affiliate code
4. Share the link: `/payment?ref=ABDU-XXXXXX`
5. Complete a test purchase with the affiliate code
6. Verify €50 discount is applied
7. Verify affiliate earnings are tracked

### Test Admin Dashboard:
1. Login as admin
2. Go to `/admin`
3. View payments, products, affiliates, users
4. Test payout approval flow

## Important Notes

- **Database ID**: Make sure to use the correct Database ID from Appwrite, not the Project ID
- **Webhook URL**: Update the webhook URL in Stripe when deploying to production
- **Test Mode**: All Stripe operations use test mode keys - switch to live keys for production
- **Permissions**: The setup script sets up collection permissions - review them in Appwrite console

## Troubleshooting

### Appwrite Setup Fails:
- Check that API key has proper permissions
- Verify Database ID is correct
- Check that collections don't already exist (script handles this)

### Stripe Webhook Not Working:
- Verify webhook secret is correct
- Check webhook endpoint is accessible
- Use Stripe CLI for local testing

### Access Not Granted After Payment:
- Check webhook is receiving events
- Verify webhook handler is processing `checkout.session.completed`
- Check Appwrite user document is being updated

## Next Steps

After testing the payment system, proceed with Phase 11 (Course Backend & Video Management) from the plan.
