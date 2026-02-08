import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/checkout';
import { STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/config';
import { validateAffiliateCode } from '@/lib/affiliates/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail, productId, affiliateCode, successUrl, cancelUrl } = body;

    // Validate required fields
    if (!userId || !userEmail || !productId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate affiliate code if provided
    let validatedAffiliateCode: string | undefined = undefined;
    if (affiliateCode && affiliateCode.trim()) {
      const validation = await validateAffiliateCode(affiliateCode.trim().toUpperCase());
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || 'Invalid affiliate code' },
          { status: 400 }
        );
      }
      validatedAffiliateCode = affiliateCode.trim().toUpperCase();
    }

    // Create checkout session
    const session = await createCheckoutSession({
      userId,
      userEmail,
      productId,
      affiliateCode: validatedAffiliateCode,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
