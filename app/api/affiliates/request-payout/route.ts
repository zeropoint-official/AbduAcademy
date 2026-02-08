import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { affiliates, payouts, affiliateReferrals } from '@/lib/appwrite/database';
import { Query } from 'appwrite';
import { ID } from 'appwrite';

interface AffiliateReferralDocument {
  $id: string;
  referralId: string;
  affiliateId: string;
}

interface AffiliateDocument {
  $id: string;
  affiliateId: string;
  totalEarnings?: number;
  pendingEarnings?: number;
  paidEarnings?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const body = await request.json();
    const { amount, paymentDetails, referralId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!paymentDetails || paymentDetails.trim().length === 0) {
      return NextResponse.json(
        { error: 'Payment details are required' },
        { status: 400 }
      );
    }

    // If referralId is provided, validate it belongs to this affiliate
    if (referralId) {
      const { affiliateReferrals } = await import('@/lib/appwrite/database');
      const referralDocs = await affiliateReferrals.list<AffiliateReferralDocument>([
        Query.equal('referralId', referralId),
      ]);

      if (referralDocs.documents.length === 0) {
        return NextResponse.json(
          { error: 'Referral not found' },
          { status: 404 }
        );
      }

      const referral = referralDocs.documents[0];
      const affiliateDocs = await affiliates.list<AffiliateDocument>([
        Query.equal('userId', user.userId),
      ]);

      if (affiliateDocs.documents.length === 0 || referral.affiliateId !== affiliateDocs.documents[0].$id) {
        return NextResponse.json(
          { error: 'Referral does not belong to this affiliate' },
          { status: 403 }
        );
      }

      // Check if payout already requested for this referral
      const existingPayouts = await payouts.list([
        Query.equal('referralId', referralId),
      ]);

      if (existingPayouts.documents.length > 0) {
        return NextResponse.json(
          { error: 'Payout already requested for this referral' },
          { status: 400 }
        );
      }
    }

    // Get affiliate record
    const affiliateDocs = await affiliates.list<AffiliateDocument>([
      Query.equal('userId', user.userId),
    ]);

    if (affiliateDocs.documents.length === 0) {
      return NextResponse.json(
        { error: 'No affiliate code found' },
        { status: 404 }
      );
    }

    const affiliate = affiliateDocs.documents[0];

    // Calculate available earnings
    const availableEarnings = Math.max(
      0,
      (affiliate.totalEarnings || 0) - (affiliate.pendingEarnings || 0) - (affiliate.paidEarnings || 0)
    );

    // Validate amount
    const requestedAmount = Math.round(amount * 100); // Convert to cents
    if (requestedAmount > availableEarnings) {
      return NextResponse.json(
        { error: 'Requested amount exceeds available earnings' },
        { status: 400 }
      );
    }

    // Create payout request
    const payoutId = ID.unique();
    const payoutData: any = {
      payoutId,
      affiliateId: affiliate.$id,
      requestedBy: user.userId,
      amount: requestedAmount,
      status: 'requested',
      paymentDetails,
      requestedAt: new Date().toISOString(),
    };

    // Link to referral if provided
    if (referralId) {
      payoutData.referralId = referralId;
    }

    await payouts.create(payoutData);

    // Update affiliate pending earnings
    await affiliates.update(affiliate.$id, {
      pendingEarnings: (affiliate.pendingEarnings || 0) + requestedAmount,
      updatedAt: new Date().toISOString(),
    });

    // Update referral status if linked
    if (referralId) {
      const referralDocs = await affiliateReferrals.list<AffiliateReferralDocument>([
        Query.equal('referralId', referralId),
      ]);
      if (referralDocs.documents.length > 0) {
        // Mark that payout was requested (status stays 'pending' until admin approves)
        // We could add a 'payoutRequested' field, but for now we'll check payouts collection
      }
    }

    return NextResponse.json({
      payoutId,
      message: 'Payout request created successfully',
    });
  } catch (error: any) {
    console.error('Error creating payout request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payout request' },
      { status: 500 }
    );
  }
}
