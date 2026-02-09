import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/appwrite/server-auth';
import { handleCheckoutCompleted } from '../route';
import Stripe from 'stripe';

/**
 * Admin-only endpoint to simulate webhook events for testing
 * This allows testing the counter and email functionality without real Stripe payments
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const user = await getServerUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, userEmail, productId = 'test-early-access', amount = 1999 } = body;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and userEmail' },
        { status: 400 }
      );
    }

    // Create a mock Stripe checkout session
    const mockSession = {
      id: `cs_test_${Date.now()}`,
      object: 'checkout.session' as const,
      customer_email: userEmail,
      customer_details: {
        email: userEmail,
        name: body.customerName || undefined,
      },
      payment_intent: `pi_test_${Date.now()}`,
      metadata: {
        userId,
        productId,
        originalPrice: amount.toString(),
        finalPrice: amount.toString(),
        discountAmount: '0',
        affiliateCode: body.affiliateCode || '',
      },
      // Add other required fields with minimal values
      amount_total: amount,
      currency: 'eur' as const,
      mode: 'payment' as const,
      status: 'complete' as const,
      success_url: '',
      cancel_url: '',
      payment_status: 'paid' as const,
    } as unknown as Stripe.Checkout.Session;

    console.log('[Test Webhook] Simulating checkout.session.completed event', {
      sessionId: mockSession.id,
      userId,
      userEmail,
      productId,
    });

    // Process the mock session
    await handleCheckoutCompleted(mockSession);

    return NextResponse.json({
      success: true,
      message: 'Test webhook processed successfully',
      sessionId: mockSession.id,
    });
  } catch (error: any) {
    console.error('[Test Webhook] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process test webhook' },
      { status: 500 }
    );
  }
}
