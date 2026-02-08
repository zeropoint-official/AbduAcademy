import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';

const EARLY_ACCESS_PRICE = 1999; // €19.99 in cents

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail, successUrl, cancelUrl } = body;

    // Validate required fields
    if (!userId || !userEmail || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a price for early access
    const price = await stripe.prices.create({
      product_data: {
        name: 'Early Access - Abdu Academy',
      },
      unit_amount: EARLY_ACCESS_PRICE,
      currency: 'eur',
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      metadata: {
        userId,
        productId: 'early-access',
        originalPrice: EARLY_ACCESS_PRICE.toString(),
        finalPrice: EARLY_ACCESS_PRICE.toString(),
        discountAmount: '0',
        affiliateCode: '',
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating early access checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
