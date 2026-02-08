import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/config';
import { payments, users, affiliates, affiliateReferrals } from '@/lib/appwrite/database';
import { ID, Query } from 'appwrite';
import Stripe from 'stripe';

interface PaymentDocument {
  $id: string;
  paymentId: string;
  status: string;
  stripePaymentIntentId?: string;
  affiliateUserId?: string;
}

interface AffiliateDocument {
  $id: string;
  userId: string;
  totalEarnings?: number;
  totalReferrals?: number;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata) {
    console.error('No metadata in checkout session');
    return;
  }

  const userId = metadata.userId;
  const productId = metadata.productId;
  const affiliateCode = metadata.affiliateCode;
  const originalPrice = parseInt(metadata.originalPrice || '0');
  const finalPrice = parseInt(metadata.finalPrice || '0');
  const discountAmount = parseInt(metadata.discountAmount || '0');

  // Get payment intent ID
  const paymentIntentId = typeof session.payment_intent === 'string' 
    ? session.payment_intent 
    : session.payment_intent?.id;

  // Create payment record
  const paymentId = ID.unique();
  await payments.create({
    paymentId,
    userId,
    productId,
    stripeSessionId: session.id,
    stripePaymentIntentId: paymentIntentId || null,
    amount: finalPrice,
    discountAmount,
    affiliateCode: affiliateCode || null,
    affiliateUserId: null, // Will be set if affiliate code is valid
    status: 'completed',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  });

  // Grant user access
  console.log(`[Webhook] Processing payment for userId: ${userId}`);
  interface UserDocument {
    $id: string;
    userId: string;
    hasAccess?: boolean;
  }
  const userDocs = await users.list<UserDocument>([Query.equal('userId', userId)]);
  
  if (userDocs.documents.length === 0) {
    console.error(`[Webhook] User not found with userId: ${userId}. User must be logged in and have a user record in Appwrite.`);
    // Note: If userId is 'guest', user won't be found. User must be logged in to receive access.
    return; // Don't throw - webhook should still return success to Stripe
  }

  const userDoc = userDocs.documents[0];
  console.log(`[Webhook] Found user: ${userDoc.$id}, current hasAccess: ${userDoc.hasAccess}`);
  
  await users.update(userDoc.$id, {
    hasAccess: true,
    purchaseDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  console.log(`[Webhook] Successfully granted access to user: ${userDoc.$id}`);

  // Process affiliate earnings if affiliate code was used
  if (affiliateCode) {
    await processAffiliateEarnings({
      affiliateCode,
      paymentId,
      buyerUserId: userId,
      discountAmount,
    });
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Update payment status if needed
  const paymentDocs = await payments.list<PaymentDocument>([
    Query.equal('stripePaymentIntentId', paymentIntent.id),
  ]);

  if (paymentDocs.documents.length > 0) {
    const payment = paymentDocs.documents[0];
    if (payment.status !== 'completed') {
      await payments.update(payment.$id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
    }
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Update payment status
  const paymentDocs = await payments.list<PaymentDocument>([
    Query.equal('stripePaymentIntentId', paymentIntent.id),
  ]);

  if (paymentDocs.documents.length > 0) {
    await payments.update(paymentDocs.documents[0].$id, {
      status: 'failed',
    });
  }
}

async function processAffiliateEarnings({
  affiliateCode,
  paymentId,
  buyerUserId,
  discountAmount,
}: {
  affiliateCode: string;
  paymentId: string;
  buyerUserId: string;
  discountAmount: number;
}) {
  try {
    // Find affiliate by code
    const affiliateDocs = await affiliates.list<AffiliateDocument>([Query.equal('code', affiliateCode)]);
    
    if (affiliateDocs.documents.length === 0) {
      console.error(`Affiliate not found for code: ${affiliateCode}`);
      return;
    }

    const affiliate = affiliateDocs.documents[0];
    const affiliateUserId = affiliate.userId;
    const affiliateEarnings = discountAmount; // €50

    // Create affiliate referral record
    const referralId = ID.unique();
    await affiliateReferrals.create({
      referralId,
      affiliateId: affiliate.$id,
      paymentId,
      buyerUserId,
      earnings: affiliateEarnings,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    // Update affiliate earnings
    // Note: Only update totalEarnings when referral completes
    // pendingEarnings only increases when payout is requested
    const currentTotalEarnings = affiliate.totalEarnings || 0;
    const currentTotalReferrals = affiliate.totalReferrals || 0;

    await affiliates.update(affiliate.$id, {
      totalEarnings: currentTotalEarnings + affiliateEarnings,
      totalReferrals: currentTotalReferrals + 1,
      // Don't add to pendingEarnings here - that only happens when payout is requested
      updatedAt: new Date().toISOString(),
    });

    // Update payment with affiliate user ID
    const paymentDocs = await payments.list<PaymentDocument>([Query.equal('paymentId', paymentId)]);
    if (paymentDocs.documents.length > 0) {
      await payments.update(paymentDocs.documents[0].$id, {
        affiliateUserId,
      });
    }
  } catch (error) {
    console.error('Error processing affiliate earnings:', error);
    // Don't throw - we don't want to fail the payment if affiliate processing fails
  }
}
