# Affiliate System Documentation

## Overview

The affiliate system allows users to create affiliate codes, share them, and earn €50 for each referral who purchases the course. Affiliates can request payouts of €50 per referral, which admins can approve.

## Features

### 1. Create Affiliate Code (One-Time)
- Users can create **one affiliate code** per account
- Code format: `ABDU-XXXXXX` (6 random alphanumeric characters)
- Created via `/account` → Affiliates tab → "Create Affiliate Code" button
- API: `POST /api/affiliates/create`

### 2. Share Affiliate Link
- Share link format: `https://yourdomain.com/payment?ref=ABDU-XXXXXX`
- When someone uses this link, they get **€50 discount** (€399 → €349)
- Affiliate earns **€50** per successful referral

### 3. Monitor Referrals
- View total referrals, earnings, and referral history
- See status of each referral (pending, paid)
- Track available earnings vs pending/paid earnings

### 4. Request Payout (€50 per Referral)
- Affiliates can request **€50 payout per individual referral**
- Each referral can only have one payout request
- Payout requests go to admin for approval
- Status: `requested` → `approved` → `completed` (or `rejected`)

## User Flow

### For Affiliates (Referrers)

1. **Create Affiliate Code**:
   - Go to `/account` → Affiliates tab
   - Click "Create Affiliate Code"
   - Code is generated (e.g., `ABDU-ABC123`)
   - Share link is displayed: `/payment?ref=ABDU-ABC123`

2. **Share Your Link**:
   - Copy the share link
   - Share with potential buyers
   - When they purchase using your link, you earn €50

3. **Monitor Earnings**:
   - View total earnings, referrals, and available balance
   - See referral history with dates and status

4. **Request Payout**:
   - Go to Referral History tab
   - For each pending referral, click "Request €50 Payout"
   - Enter payment details (PayPal, bank account, etc.)
   - Submit request (goes to admin for approval)

### For Buyers (Using Affiliate Code)

1. **Use Affiliate Link**:
   - Click affiliate link: `/payment?ref=ABDU-ABC123`
   - Affiliate code is automatically applied
   - Price shows: ~~€399~~ **€349** (€50 discount)

2. **Complete Purchase**:
   - Fill out checkout form
   - Complete payment via Stripe
   - Get course access

3. **Affiliate Gets Credit**:
   - Webhook processes payment
   - Creates referral record for affiliate
   - Affiliate sees new referral in dashboard

## Technical Implementation

### Database Collections

#### `affiliates`
- `affiliateId`: Unique ID
- `userId`: User who owns the affiliate code
- `code`: Affiliate code (e.g., `ABDU-ABC123`)
- `totalEarnings`: Total earned (in cents)
- `totalReferrals`: Number of referrals
- `pendingEarnings`: Earnings awaiting payout (in cents)
- `paidEarnings`: Earnings already paid out (in cents)
- `isActive`: Whether affiliate is active

#### `affiliateReferrals`
- `referralId`: Unique ID
- `affiliateId`: Link to affiliate
- `paymentId`: Link to payment
- `buyerUserId`: User who purchased
- `earnings`: Amount earned (€50 = 5000 cents)
- `status`: `pending`, `paid`, `cancelled`
- `createdAt`: When referral was created
- `paidAt`: When payout was completed

#### `payouts`
- `payoutId`: Unique ID
- `affiliateId`: Link to affiliate
- `referralId`: Link to specific referral (optional)
- `requestedBy`: User who requested payout
- `amount`: Payout amount (in cents)
- `status`: `requested`, `approved`, `completed`, `rejected`
- `paymentDetails`: Payment info (PayPal, bank, etc.)
- `requestedAt`: When request was made
- `approvedAt`: When admin approved
- `completedAt`: When payout was completed

### API Endpoints

#### `POST /api/affiliates/create`
- Creates affiliate code for authenticated user
- Returns: `{ affiliateId, code, message }`
- **One code per user** - returns existing code if already exists

#### `GET /api/affiliates/stats`
- Gets affiliate stats and referral history
- Returns: `{ hasAffiliate, affiliate, referrals }`
- Includes `payoutRequested` flag for each referral

#### `POST /api/affiliates/request-payout`
- Creates payout request
- Body: `{ amount: 50, paymentDetails: "...", referralId?: "..." }`
- If `referralId` provided, links payout to specific referral
- Validates referral belongs to affiliate
- Prevents duplicate payout requests for same referral

### Payment Flow Integration

When a payment is completed with an affiliate code:

1. **Webhook receives `checkout.session.completed`**
2. **Extracts affiliate code** from session metadata
3. **Finds affiliate** by code
4. **Creates referral record**:
   - Links to affiliate
   - Sets earnings to €50 (5000 cents)
   - Status: `pending`
5. **Updates affiliate stats**:
   - Increments `totalReferrals`
   - Adds €50 to `totalEarnings`
   - Adds €50 to `pendingEarnings`

### Discount Application

- **Base Price**: €399 (39900 cents)
- **Discount**: €50 (5000 cents)
- **Final Price with Code**: €349 (34900 cents)
- Applied in `createCheckoutSession()` when `affiliateCode` is provided

## Admin Features

Admins can:
- View all payout requests in `/admin/payouts`
- Approve/reject payout requests
- See payout history
- View affiliate statistics

## Testing the System

### Test Affiliate Flow

1. **Create Test Affiliate**:
   - Login as User A
   - Go to `/account` → Affiliates tab
   - Click "Create Affiliate Code"
   - Copy share link (e.g., `/payment?ref=ABDU-ABC123`)

2. **Test Purchase with Code**:
   - Open incognito/private window
   - Go to share link: `/payment?ref=ABDU-ABC123`
   - Verify price shows €349 (not €399)
   - Complete test payment with Stripe test card

3. **Verify Referral Created**:
   - Login as User A
   - Go to `/account` → Affiliates tab
   - Check "Total Referrals" increased by 1
   - Check "Total Earnings" increased by €50
   - See new referral in "Referral History"

4. **Request Payout**:
   - In Referral History, click "Request €50 Payout" for the referral
   - Enter payment details
   - Submit request
   - Verify "Available" earnings decreased by €50
   - Verify "Pending" earnings increased by €50

5. **Admin Approve Payout**:
   - Login as admin
   - Go to `/admin/payouts`
   - Find payout request
   - Approve payout
   - Verify referral status changes to `paid`

## Current Status

✅ **Affiliate Code Creation**: Implemented (one per user)
✅ **Share Link Generation**: Implemented
✅ **Discount Application**: Implemented (€50 off)
✅ **Referral Tracking**: Implemented
✅ **Earnings Calculation**: Implemented
✅ **Per-Referral Payout Requests**: Implemented (€50 each)
✅ **Payout Request Validation**: Implemented (prevents duplicates)
✅ **Admin Payout Management**: Implemented (in admin dashboard)

## Important Notes

- **One Affiliate Code Per User**: Users can only create one affiliate code
- **€50 Per Referral**: Fixed earnings amount per referral
- **Per-Referral Payouts**: Each referral can have one payout request
- **Payout Amount**: Always €50 per referral (5000 cents)
- **Discount Amount**: Always €50 off purchase price
- **Webhook Required**: Affiliate earnings are processed via Stripe webhook

## Database Schema Updates Needed

If you haven't run the setup script recently, you may need to add the `referralId` field to the `payouts` collection:

```bash
pnpm run setup:appwrite
```

This will add the `referralId` field to link payouts to specific referrals.
