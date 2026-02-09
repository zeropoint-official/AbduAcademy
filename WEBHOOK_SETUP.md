# Webhook Setup Guide

This guide will help you set up and test Stripe webhooks for production, fix counter issues, and test without spending real money.

## Table of Contents

1. [Production Webhook Setup](#production-webhook-setup)
2. [Testing Production Webhooks](#testing-production-webhooks)
3. [Troubleshooting](#troubleshooting)
4. [Email Configuration](#email-configuration)

## Production Webhook Setup

### Step 1: Configure Webhook in Stripe Dashboard

1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Click "Add endpoint"**
3. **Enter your production webhook URL:**
   ```
   https://your-domain.com/api/stripe/webhook
   ```
   Replace `your-domain.com` with your actual Vercel/production domain.

4. **Select events to listen for:**
   - `checkout.session.completed` (required)
   - `payment_intent.succeeded` (optional, for redundancy)
   - `payment_intent.payment_failed` (optional, for tracking failures)

5. **Copy the webhook signing secret:**
   - After creating the endpoint, Stripe will show a webhook signing secret (starts with `whsec_`)
   - Copy this secret

### Step 2: Add Webhook Secret to Vercel

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add the following environment variable:**
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** The webhook secret from Stripe (starts with `whsec_`)
   - **Environment:** Production (and Preview if you want)

3. **Redeploy your application** after adding the environment variable

### Step 3: Verify Webhook Configuration

Use the admin endpoint to check webhook status:

```bash
# Make sure you're logged in as admin
GET /api/admin/webhook-status
```

This will show:
- Whether webhook secret is configured
- Whether webhook secret is valid (starts with `whsec_`)
- Whether Resend API key is configured
- Environment configuration

## Testing Production Webhooks

### Option 1: Stripe CLI (Recommended for Testing)

You can forward Stripe test webhooks to your production URL without spending real money:

1. **Install Stripe CLI** (if not already installed):
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe CLI:**
   ```bash
   stripe login
   ```

3. **Forward test webhooks to production:**
   ```bash
   stripe listen --forward-to https://your-domain.com/api/stripe/webhook
   ```
   
   This will:
   - Forward all Stripe test webhook events to your production URL
   - Display a webhook signing secret (different from production secret)
   - Keep running until you stop it (Ctrl+C)

4. **In another terminal, trigger a test payment:**
   ```bash
   stripe trigger checkout.session.completed
   ```

5. **Check your production logs** to see if the webhook was received and processed

**Note:** When using Stripe CLI, the webhook secret will be different. You can either:
- Use the CLI secret temporarily for testing (update `STRIPE_WEBHOOK_SECRET` in Vercel)
- Or use the test endpoints below (Option 2)

### Option 2: Test Endpoints (Admin Only)

#### Test Webhook Endpoint

Simulate a webhook event without Stripe:

```bash
POST /api/stripe/webhook/test
Content-Type: application/json
Authorization: (admin session required)

{
  "userId": "user-id-from-appwrite",
  "userEmail": "test@example.com",
  "productId": "early-access",
  "amount": 1999,
  "customerName": "Test User",
  "affiliateCode": "" // optional
}
```

This will:
- Create a payment record in Appwrite
- Grant user access
- Send confirmation email
- Update the counter

#### Test Payment Endpoint

Create a test payment record directly (bypasses Stripe entirely):

```bash
POST /api/admin/test-payment
Content-Type: application/json
Authorization: (admin session required)

{
  "userId": "user-id-from-appwrite",
  "productId": "early-access",
  "amount": 1999
}
```

This will:
- Create a payment record in Appwrite
- Grant user access
- Update the counter
- **Note:** This does NOT send an email (use test webhook endpoint for that)

### Option 3: Manual Testing with Test Cards

1. **Use Stripe test cards** in production (if using test keys):
   - Card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

2. **Complete a test checkout** on your production site

3. **Check webhook logs** in Stripe Dashboard → Developers → Webhooks → Your endpoint → Recent events

## Troubleshooting

### Counter Not Updating

1. **Check webhook is receiving events:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click on your webhook endpoint
   - Check "Recent events" - you should see `checkout.session.completed` events

2. **Check webhook is processing successfully:**
   - Look for events with status "Succeeded" (green)
   - If you see "Failed" (red), click on it to see the error

3. **Check webhook secret:**
   ```bash
   GET /api/admin/webhook-status
   ```
   - Verify `secretConfigured` is `true`
   - Verify `secretValid` is `true` (starts with `whsec_`)

4. **Check Vercel logs:**
   - Go to Vercel Dashboard → Your Project → Deployments → Latest → Functions
   - Look for `/api/stripe/webhook` logs
   - Check for errors or warnings

5. **Common issues:**
   - **Webhook secret mismatch:** Make sure `STRIPE_WEBHOOK_SECRET` in Vercel matches the secret from Stripe Dashboard
   - **Webhook not configured:** Make sure webhook endpoint is created in Stripe Dashboard
   - **Wrong URL:** Make sure webhook URL in Stripe points to your production domain
   - **User not found:** Webhook will still succeed, but user won't get access. Make sure user is logged in and has a user record in Appwrite

### Email Not Sending

1. **Check Resend API key:**
   ```bash
   GET /api/admin/webhook-status
   ```
   - Verify `resendApiKeyConfigured` is `true`

2. **Check Resend dashboard:**
   - Go to Resend Dashboard → Emails
   - Check if emails are being sent
   - Check for any errors

3. **Check email logs:**
   - Look for `[Resend]` logs in Vercel function logs
   - Check for errors or warnings

4. **Common issues:**
   - **API key not set:** Add `RESEND_API_KEY` to Vercel environment variables
   - **Domain not verified:** Make sure your "from" email domain is verified in Resend
   - **Email address invalid:** Check that customer email is valid

### Webhook Signature Verification Failed

This error means the webhook secret doesn't match:

1. **Check webhook secret in Stripe:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click on your webhook endpoint
   - Click "Reveal" next to "Signing secret"
   - Copy the secret

2. **Update Vercel environment variable:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Update `STRIPE_WEBHOOK_SECRET` with the correct secret
   - Redeploy your application

3. **Verify secret format:**
   - Should start with `whsec_`
   - Should be about 50-60 characters long

## Email Configuration

### Step 1: Get Resend API Key

1. **Go to Resend Dashboard:** https://resend.com
2. **Sign up or log in**
3. **Go to API Keys** section
4. **Create a new API key** (or use existing one)
5. **Copy the API key**

### Step 2: Add to Environment Variables

1. **Local development** (`.env.local`):
   ```env
   RESEND_API_KEY=re_your_api_key_here
   ```

2. **Vercel production:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add `RESEND_API_KEY` with your Resend API key
   - Select "Production" environment
   - Redeploy your application

### Step 3: Verify Domain (Optional but Recommended)

1. **Go to Resend Dashboard** → Domains
2. **Add your domain** (e.g., `your-domain.com`)
3. **Add DNS records** as instructed by Resend
4. **Update `DEFAULT_FROM_EMAIL`** in `lib/resend/client.ts`:
   ```typescript
   export const DEFAULT_FROM_EMAIL = 'Abdu Academy <noreply@your-domain.com>';
   ```

**Note:** For testing, you can use `onboarding@resend.dev` (default), but emails may go to spam.

## Testing Checklist

Before going live, test:

- [ ] Webhook endpoint is configured in Stripe Dashboard
- [ ] Webhook secret is set in Vercel environment variables
- [ ] Webhook status endpoint shows all checks passing
- [ ] Test webhook endpoint works (admin only)
- [ ] Test payment endpoint works (admin only)
- [ ] Counter updates after test payment
- [ ] Email is sent after test payment
- [ ] Real test payment works with Stripe test cards
- [ ] Webhook logs show successful processing

## Support

If you're still having issues:

1. **Check Vercel function logs** for detailed error messages
2. **Check Stripe webhook logs** for delivery status
3. **Use webhook status endpoint** to verify configuration
4. **Test with test endpoints** to isolate the issue
