import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/checkout';
import { PROMO_CODES } from '@/lib/stripe/config';
import { validateAffiliateCode } from '@/lib/affiliates/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail, productId, affiliateCode, promoCode, successUrl, cancelUrl } = body;

    if (!userId || !userEmail || !productId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (userId === 'guest') {
      return NextResponse.json(
        { error: 'You must be logged in to make a purchase' },
        { status: 401 }
      );
    }

    // Validate promo code if provided
    let validatedPromoCode: string | undefined = undefined;
    if (promoCode && promoCode.trim()) {
      const normalizedPromo = promoCode.trim().toUpperCase();
      if (PROMO_CODES[normalizedPromo] === undefined) {
        return NextResponse.json(
          { error: 'Invalid promo code' },
          { status: 400 }
        );
      }
      validatedPromoCode = normalizedPromo;
    }

    // Validate affiliate code if provided (only matters when no promo code)
    let validatedAffiliateCode: string | undefined = undefined;
    if (!validatedPromoCode && affiliateCode && affiliateCode.trim()) {
      const validation = await validateAffiliateCode(affiliateCode.trim().toUpperCase());
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || 'Invalid affiliate code' },
          { status: 400 }
        );
      }
      validatedAffiliateCode = affiliateCode.trim().toUpperCase();
    }

    const session = await createCheckoutSession({
      userId,
      userEmail,
      productId,
      affiliateCode: validatedAffiliateCode,
      promoCode: validatedPromoCode,
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
