import { NextRequest, NextResponse } from 'next/server';
import { validateAffiliateCode } from '@/lib/affiliates/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Affiliate code is required' },
        { status: 400 }
      );
    }

    const validation = await validateAffiliateCode(code.trim().toUpperCase());

    return NextResponse.json(validation);
  } catch (error: any) {
    console.error('Error validating affiliate code:', error);
    return NextResponse.json(
      { valid: false, error: 'Error validating affiliate code' },
      { status: 500 }
    );
  }
}
