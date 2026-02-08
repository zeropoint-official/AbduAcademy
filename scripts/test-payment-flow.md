# Testing Payment Flow - Quick Guide

## Important: User Must Be Logged In!

**CRITICAL**: The payment system requires users to be **logged in** before making a payment. If a user pays while logged out (as 'guest'), the webhook won't be able to grant access because it can't find the user record.

## Quick Test Steps

### 1. Start Stripe Webhook Listener
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Keep this terminal open and watch for webhook events.

### 2. Start Dev Server
```bash
pnpm dev
```

### 3. Login/Create Account
- Go to `/register` or `/login`
- Create a test account
- **Make sure you're logged in** (check top right corner)

### 4. Make Test Payment
- Go to `/payment`
- Email should auto-fill
- Click "Proceed to Checkout"
- Use test card: `4242 4242 4242 4242`
- Complete payment

### 5. Verify Access Granted
After payment completes:

**Check Terminal 1 (Stripe CLI)** - You should see:
```
--> checkout.session.completed [evt_xxxxx]
<--  [200] POST http://localhost:3000/api/stripe/webhook
```

**Check Terminal 2 (Next.js logs)** - You should see:
```
[Webhook] Processing payment for userId: xxxxx
[Webhook] Found user: xxxxx, current hasAccess: false
[Webhook] Successfully granted access to user: xxxxx
```

**Refresh Course Page**:
- Go to `/course`
- Locked chapters should now be accessible
- Or go to `/account` - should show "You have full access"

## How to Verify Access Manually

### Option 1: Check Appwrite Console
1. Go to Appwrite Console → Database → `users` collection
2. Find your user document
3. Check `hasAccess` field - should be `true`
4. Check `purchaseDate` - should be set

### Option 2: Check Browser Console
1. Open browser DevTools → Console
2. Run: `await fetch('/api/auth/get-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: 'YOUR_USER_ID' }) }).then(r => r.json())`
3. Look for `hasAccess: true` in response

### Option 3: Check Account Page
- Go to `/account`
- Should show "You have full access" if `hasAccess` is true

## Troubleshooting

### Payment completed but no access?

1. **Check if user was logged in**:
   - If you paid as 'guest', access won't be granted
   - You must be logged in before payment

2. **Check webhook logs**:
   - Look for `[Webhook] User not found` error
   - This means userId doesn't match any user in database

3. **Check userId format**:
   - Webhook looks for user by `userId` field (not `$id`)
   - `userId` should be the Appwrite Auth user ID (`appwriteUser.$id`)

4. **Manually grant access** (for testing):
   - Go to Appwrite Console → Database → `users`
   - Find your user
   - Set `hasAccess` to `true`
   - Set `purchaseDate` to current date/time
   - Refresh course page

### Webhook not receiving events?

1. **Verify Stripe CLI is running**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. **Check webhook secret matches**:
   - Terminal 1 shows: `Ready! Your webhook signing secret is whsec_xxxxx`
   - `.env.local` should have: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`
   - They must match!

3. **Check Next.js server logs**:
   - Look for webhook endpoint errors
   - Check if `/api/stripe/webhook` route exists

## Current Status

✅ **Payment System**: Configured and ready
✅ **Webhook Handler**: Implemented with logging
✅ **Access Control**: Checks `hasAccess` field
✅ **User Model**: `hasAccess` field exists

## What Happens After Payment

1. ✅ Stripe processes payment
2. ✅ Stripe sends `checkout.session.completed` webhook
3. ✅ Webhook receives event (check Terminal 1)
4. ✅ Webhook finds user by `userId` from metadata
5. ✅ Webhook updates `hasAccess: true` in database
6. ✅ User refreshes page → `getCurrentUser()` fetches updated data
7. ✅ Locked content becomes accessible

## Testing with Test Cards

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

Any future expiry date and any CVC works.
