# Payment Flow & Access Control

## How Paid vs Non-Paid Users Are Determined

The system uses the `hasAccess` boolean field in the `users` collection in Appwrite to determine if a user has paid for the course.

### User Access Field

- **Field Name**: `hasAccess` (boolean)
- **Default Value**: `false` (for new users)
- **Location**: Appwrite `users` collection
- **Updated By**: Stripe webhook after successful payment

## Payment Flow

### 1. User Initiates Payment
- User goes to `/payment` page
- Fills out checkout form with email and optional affiliate code
- Clicks "Proceed to Checkout"
- Redirected to Stripe Checkout page

### 2. Stripe Checkout Session Created
- **API Route**: `/api/stripe/create-checkout`
- Creates Stripe Checkout Session with metadata:
  - `userId`: The Appwrite user ID (`appwriteUser.$id`)
  - `userEmail`: User's email
  - `productId`: Product identifier
  - `affiliateCode`: Optional affiliate code
  - `originalPrice`: Original price
  - `finalPrice`: Final price after discount
  - `discountAmount`: Discount amount

### 3. User Completes Payment
- User enters payment details in Stripe Checkout
- Uses test card: `4242 4242 4242 4242` (for testing)
- Payment is processed by Stripe

### 4. Stripe Webhook Triggered
- **Webhook Endpoint**: `/api/stripe/webhook`
- **Event**: `checkout.session.completed`
- Stripe sends webhook event to your server

### 5. Webhook Grants Access
The webhook handler (`handleCheckoutCompleted`) does the following:

```typescript
// 1. Extract userId from session metadata
const userId = metadata.userId;

// 2. Find user in Appwrite database
const userDocs = await users.list([Query.equal('userId', userId)]);

// 3. Update user's hasAccess field
if (userDocs.documents.length > 0) {
  await users.update(userDocs.documents[0].$id, {
    hasAccess: true,
    purchaseDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
```

### 6. User Gets Access
- `hasAccess` is set to `true` in the database
- User can now access locked chapters and episodes
- Locked content checks: `chapter.isLocked && !user.hasAccess`

## Testing the Payment Flow

### Prerequisites

1. **Stripe CLI Installed**:
   ```bash
   # Install Stripe CLI (if not already installed)
   brew install stripe/stripe-cli/stripe
   ```

2. **Stripe Webhook Secret Configured**:
   - Check `.env.local` has `STRIPE_WEBHOOK_SECRET`
   - You already have: `whsec_995b45070139965f6a646f60c99882dbf7cc6241099a60e4f91c739ad4a64daf`

### Step-by-Step Test Process

#### 1. Start Stripe Webhook Listener (Terminal 1)
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Important**: Keep this running! You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxx
> Forwarding events to localhost:3000/api/stripe/webhook
```

#### 2. Start Next.js Dev Server (Terminal 2)
```bash
pnpm dev
```

#### 3. Create/Login as Test User
- Go to `/register` or `/login`
- Create a test account (e.g., `test@example.com`)
- Make sure you're logged in

#### 4. Go to Payment Page
- Navigate to `/payment`
- Enter your email (should auto-fill if logged in)
- Optionally enter an affiliate code
- Click "Proceed to Checkout"

#### 5. Complete Test Payment
- You'll be redirected to Stripe Checkout
- Use Stripe test card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)
- Click "Pay"

#### 6. Verify Webhook Received
In Terminal 1 (Stripe CLI), you should see:
```
2024-01-XX XX:XX:XX   --> checkout.session.completed [evt_xxxxx]
2024-01-XX XX:XX:XX  <--  [200] POST http://localhost:3000/api/stripe/webhook [evt_xxxxx]
```

#### 7. Check User Access Updated
After payment completes:

**Option A: Check in Appwrite Console**
1. Go to Appwrite Console → Database → `users` collection
2. Find your user document
3. Verify `hasAccess` field is now `true`
4. Verify `purchaseDate` is set

**Option B: Check in App**
1. Refresh the course page (`/course`)
2. Locked chapters should now be accessible
3. Go to `/account` - should show "You have full access"

**Option C: Check via API**
```bash
# Get your userId from Appwrite or browser console
curl -X POST http://localhost:3000/api/auth/get-user \
  -H "Content-Type: application/json" \
  -d '{"userId": "YOUR_USER_ID"}'
```

Look for `"hasAccess": true` in the response.

## Troubleshooting

### Issue: Payment completes but user still doesn't have access

**Check 1: Webhook Received?**
- Check Terminal 1 (Stripe CLI) for webhook events
- If no events, webhook isn't configured correctly

**Check 2: Webhook Secret Match?**
- Verify `.env.local` has the correct `STRIPE_WEBHOOK_SECRET`
- Must match the secret from `stripe listen` command

**Check 3: User Found?**
- Check webhook logs in Terminal 1
- Look for errors like "User not found"
- Verify `userId` in checkout metadata matches Appwrite `userId` field

**Check 4: Database Update Failed?**
- Check Appwrite Console for errors
- Verify user document exists
- Check if `hasAccess` field exists in collection schema

**Check 5: User Session Refresh?**
- After payment, user needs to refresh the page
- Or logout and login again to refresh session
- `getCurrentUser()` fetches fresh data from database

### Issue: Webhook not receiving events

1. **Verify Stripe CLI is running**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. **Check Next.js server is running**:
   ```bash
   pnpm dev
   ```

3. **Verify webhook endpoint is accessible**:
   - Check `http://localhost:3000/api/stripe/webhook` exists
   - Should return 400 (missing signature) if accessed directly

4. **Check Stripe Dashboard**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - For local dev, you should see CLI webhook forwarding active

### Issue: User ID Mismatch

The webhook looks up users by `userId` field:
```typescript
const userDocs = await users.list([Query.equal('userId', userId)]);
```

**Verify**:
- Checkout session metadata includes correct `userId`
- `userId` in metadata matches `userId` field in Appwrite `users` collection
- Not using `$id` (document ID) - must use `userId` field

### Manual Access Grant (For Testing)

If webhook isn't working, you can manually grant access:

**Option 1: Via Appwrite Console**
1. Go to Appwrite Console → Database → `users` collection
2. Find your user document
3. Edit document
4. Set `hasAccess` to `true`
5. Set `purchaseDate` to current date/time
6. Save

**Option 2: Via API Route (if you create one)**
```typescript
// POST /api/admin/grant-access
await users.update(userId, {
  hasAccess: true,
  purchaseDate: new Date().toISOString(),
});
```

## Current Setup Status

✅ **Stripe Configuration**: Configured
- `STRIPE_SECRET_KEY`: Set
- `STRIPE_WEBHOOK_SECRET`: Set

✅ **Webhook Handler**: Implemented
- Handles `checkout.session.completed` event
- Updates `hasAccess` field in database
- Sets `purchaseDate`

✅ **User Model**: Configured
- `hasAccess` field exists in `users` collection
- Defaults to `false` for new users

✅ **Access Control**: Implemented
- Chapters check: `chapter.isLocked && !user.hasAccess`
- Episodes check: `episode.isLocked && !user.hasAccess`

## Testing Checklist

- [ ] Stripe CLI is running and forwarding webhooks
- [ ] Next.js dev server is running
- [ ] User is logged in
- [ ] Payment page loads correctly
- [ ] Checkout session is created successfully
- [ ] Stripe Checkout redirects correctly
- [ ] Test payment completes successfully
- [ ] Webhook event is received (check Terminal 1)
- [ ] Webhook processes successfully (check Terminal 1 logs)
- [ ] User `hasAccess` is updated in Appwrite
- [ ] Locked content becomes accessible after refresh
- [ ] Account page shows "You have full access"

## Next Steps After Payment

After a successful payment:
1. User is redirected to `/payment/success`
2. Webhook processes in background (may take a few seconds)
3. User should refresh the page or navigate to `/course`
4. Locked chapters/episodes should now be accessible
5. User can see their access status in `/account`
