import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/config';
import { payments, users, affiliates, affiliateReferrals } from '@/lib/appwrite/database';
import { ID, Query } from 'appwrite';
import Stripe from 'stripe';
import { sendPaymentConfirmationEmail } from '@/lib/resend/send-email';

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

  console.log('[Webhook] Received webhook request');

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    console.error('[Webhook] Missing signature or webhook secret', {
      hasSignature: !!signature,
      hasSecret: !!STRIPE_WEBHOOK_SECRET,
    });
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    console.log(`[Webhook] Event verified: ${event.type} (ID: ${event.id})`);
  } catch (error: any) {
    console.error('[Webhook] Signature verification failed:', {
      error: error.message,
      signatureLength: signature?.length,
      secretLength: STRIPE_WEBHOOK_SECRET?.length,
    });
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
        console.log(`[Webhook] Processing checkout.session.completed for session: ${session.id}`);
        await handleCheckoutCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] Processing payment_intent.succeeded for payment: ${paymentIntent.id}`);
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] Processing payment_intent.payment_failed for payment: ${paymentIntent.id}`);
        await handlePaymentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    console.log(`[Webhook] Successfully processed event: ${event.type}`);
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Webhook] Error processing webhook:', {
      eventType: event.type,
      eventId: event.id,
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata) {
    console.error('[Webhook] No metadata in checkout session', { sessionId: session.id });
    return;
  }

  const userId = metadata.userId;
  const productId = metadata.productId;
  const affiliateCode = metadata.affiliateCode;
  const originalPrice = parseInt(metadata.originalPrice || '0');
  const finalPrice = parseInt(metadata.finalPrice || '0');
  const discountAmount = parseInt(metadata.discountAmount || '0');

  console.log('[Webhook] Processing checkout completion', {
    sessionId: session.id,
    userId,
    productId,
    finalPrice,
    affiliateCode: affiliateCode || 'none',
  });

  // Get payment intent ID
  const paymentIntentId = typeof session.payment_intent === 'string' 
    ? session.payment_intent 
    : session.payment_intent?.id;

  // Get customer email from session (preferred) or metadata
  const customerEmail = session.customer_email || session.customer_details?.email || metadata.userEmail || null;
  console.log('[Webhook] Customer email:', customerEmail || 'not found');

  // Create payment record
  const paymentId = ID.unique();
  const purchaseDate = new Date().toISOString();
  
  try {
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
      createdAt: purchaseDate,
      completedAt: purchaseDate,
    });
    console.log('[Webhook] Payment record created:', paymentId);
  } catch (error: any) {
    console.error('[Webhook] Failed to create payment record:', error);
    throw error; // Fail webhook if payment record creation fails
  }

  // Grant user access
  console.log(`[Webhook] Processing payment for userId: ${userId}`);
  interface UserDocument {
    $id: string;
    userId: string;
    email?: string;
    name?: string;
    hasAccess?: boolean;
  }
  const userDocs = await users.list<UserDocument>([Query.equal('userId', userId)]);
  
  if (userDocs.documents.length === 0) {
    console.error(`[Webhook] User not found with userId: ${userId}. User must be logged in and have a user record in Appwrite.`);
    // Note: If userId is 'guest', user won't be found. User must be logged in to receive access.
    // Still try to send email if we have customer email from Stripe
    if (customerEmail) {
      await sendConfirmationEmail({
        customerEmail,
        customerName: session.customer_details?.name || undefined,
        productId,
        finalPrice,
        purchaseDate,
        isEarlyAccess: productId === 'early-access',
      });
    }
    return; // Don't throw - webhook should still return success to Stripe
  }

  const userDoc = userDocs.documents[0];
  console.log(`[Webhook] Found user: ${userDoc.$id}, current hasAccess: ${userDoc.hasAccess}`);
  
  // Use user email from database if available, otherwise use Stripe customer email
  const userEmail = userDoc.email || customerEmail;
  
  // Check if this is an early access purchase (including test)
  const isEarlyAccess = productId === 'early-access' || productId === 'test-early-access';
  
  try {
    await users.update(userDoc.$id, {
      hasAccess: true,
      purchaseDate,
      isEarlyAccess: isEarlyAccess, // Mark as early access user
      updatedAt: new Date().toISOString(),
    });
    console.log(`[Webhook] Successfully granted access to user: ${userDoc.$id}${isEarlyAccess ? ' (Early Access)' : ''}`);
  } catch (error: any) {
    console.error('[Webhook] Failed to update user access:', error);
    throw error; // Fail webhook if user access update fails
  }

  // Process affiliate earnings if affiliate code was used
  if (affiliateCode) {
    try {
      await processAffiliateEarnings({
        affiliateCode,
        paymentId,
        buyerUserId: userId,
        discountAmount,
      });
      console.log('[Webhook] Affiliate earnings processed successfully');
    } catch (error: any) {
      console.error('[Webhook] Failed to process affiliate earnings:', error);
      // Don't throw - we don't want to fail the payment if affiliate processing fails
    }
  }

  // Send confirmation email (don't fail webhook if email fails)
  if (userEmail) {
    try {
      await sendConfirmationEmail({
        customerEmail: userEmail,
        customerName: userDoc.name || session.customer_details?.name || undefined,
        productId,
        finalPrice,
        purchaseDate,
        isEarlyAccess,
      });
      console.log(`[Webhook] Confirmation email sent successfully to ${userEmail}`);
    } catch (error: any) {
      console.error('[Webhook] Exception sending confirmation email (non-critical):', {
        error: error.message,
        stack: error.stack,
        userEmail,
      });
      // Don't throw - email failure should not fail the webhook
    }
  } else {
    console.warn('[Webhook] No email available to send confirmation');
  }
}

/**
 * Helper function to send confirmation email
 */
async function sendConfirmationEmail({
  customerEmail,
  customerName,
  productId,
  finalPrice,
  purchaseDate,
  isEarlyAccess,
}: {
  customerEmail: string;
  customerName?: string;
  productId: string;
  finalPrice: number;
  purchaseDate: string;
  isEarlyAccess: boolean;
}) {
  // Map product IDs to display names
  const productNames: Record<string, string> = {
    'forex-course-full-access': 'Abdu Academy - Forex Mastery Course',
    'early-access': 'Early Access - Abdu Academy',
    'test-early-access': 'Test Early Access - Abdu Academy (TEST MODE)',
  };

  const productName = productNames[productId] || productId;

  const emailResult = await sendPaymentConfirmationEmail({
    customerEmail,
    customerName,
    productName,
    amount: finalPrice,
    currency: 'eur',
    purchaseDate,
    isEarlyAccess,
  });

  if (!emailResult.success) {
    console.error('[Webhook] Email sending failed:', {
      error: emailResult.error,
      customerEmail,
      productName,
    });
  } else {
    console.log(`[Webhook] Email sent successfully to ${customerEmail}`);
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
