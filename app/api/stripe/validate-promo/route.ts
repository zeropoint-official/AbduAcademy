import { NextRequest, NextResponse } from 'next/server';
import { PROMO_CODES, BASE_PRODUCT_PRICE } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Promo code is required' },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();
    const promoPrice = PROMO_CODES[normalizedCode];

    if (promoPrice !== undefined) {
      return NextResponse.json({
        valid: true,
        code: normalizedCode,
        originalPrice: BASE_PRODUCT_PRICE,
        finalPrice: promoPrice,
        discountAmount: BASE_PRODUCT_PRICE - promoPrice,
      });
    }

    return NextResponse.json(
      { valid: false, error: 'Invalid promo code' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
