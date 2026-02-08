import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { affiliates } from '@/lib/appwrite/database';
import { generateAffiliateCode, validateAffiliateCodeFormat } from '@/lib/affiliates/code-generator';
import { Query } from 'appwrite';
import { ID } from 'appwrite';

interface AffiliateDocument {
  $id: string;
  affiliateId: string;
  code: string;
  userId: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Check if user already has an affiliate code
    const existingAffiliates = await affiliates.list<AffiliateDocument>([
      Query.equal('userId', user.userId),
    ]);

    if (existingAffiliates.documents.length > 0) {
      const existing = existingAffiliates.documents[0];
      return NextResponse.json({
        affiliateId: existing.$id,
        code: existing.code,
        message: 'You already have an affiliate code',
      });
    }

    // Generate unique affiliate code
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = generateAffiliateCode();
      const existing = await affiliates.list<AffiliateDocument>([Query.equal('code', code)]);
      
      if (existing.documents.length === 0) {
        break; // Code is unique
      }
      
      attempts++;
      if (attempts >= maxAttempts) {
        return NextResponse.json(
          { error: 'Failed to generate unique affiliate code' },
          { status: 500 }
        );
      }
    } while (true);

    // Create affiliate record
    const affiliateId = ID.unique();
    await affiliates.create({
      affiliateId,
      userId: user.userId,
      code,
      totalEarnings: 0,
      totalReferrals: 0,
      pendingEarnings: 0,
      paidEarnings: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Update user record with affiliate code
    // Note: This would require updating the users collection
    // For now, we'll just return the affiliate code

    return NextResponse.json({
      affiliateId,
      code,
      message: 'Affiliate code created successfully',
    });
  } catch (error: any) {
    console.error('Error creating affiliate code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create affiliate code' },
      { status: 500 }
    );
  }
}
