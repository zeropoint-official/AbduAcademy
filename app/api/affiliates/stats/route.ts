import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { affiliates, affiliateReferrals, payouts } from '@/lib/appwrite/database';
import { Query } from 'appwrite';

interface AffiliateDocument {
  $id: string;
  code: string;
  totalEarnings?: number;
  totalReferrals?: number;
  pendingEarnings?: number;
  paidEarnings?: number;
  isActive: boolean;
}

interface AffiliateReferralDocument {
  referralId: string;
  earnings?: number;
  status?: string;
  createdAt: string;
  paidAt?: string;
}

interface PayoutDocument {
  referralId?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Get affiliate record
    const affiliateDocs = await affiliates.list<AffiliateDocument>([
      Query.equal('userId', user.userId),
    ]);

    if (affiliateDocs.documents.length === 0) {
      return NextResponse.json({
        hasAffiliate: false,
        message: 'No affiliate code found',
      });
    }

    const affiliate = affiliateDocs.documents[0];

    // Get referral history
    const referrals = await affiliateReferrals.list<AffiliateReferralDocument>([
      Query.equal('affiliateId', affiliate.$id),
      Query.orderDesc('createdAt'),
    ]);

    // Get payout requests to check which referrals have payout requested
    const payoutRequests = await payouts.list<PayoutDocument>([
      Query.equal('affiliateId', affiliate.$id),
    ]);

    // Create a map of referralId -> has payout requested
    const referralPayoutMap = new Map<string, boolean>();
    payoutRequests.documents.forEach((payout) => {
      if (payout.referralId) {
        referralPayoutMap.set(payout.referralId, true);
      }
    });

    // Calculate available earnings (totalEarnings - pendingEarnings - paidEarnings)
    const availableEarnings = Math.max(
      0,
      (affiliate.totalEarnings || 0) - (affiliate.pendingEarnings || 0) - (affiliate.paidEarnings || 0)
    );

    return NextResponse.json({
      hasAffiliate: true,
      affiliate: {
        code: affiliate.code,
        totalEarnings: affiliate.totalEarnings,
        totalReferrals: affiliate.totalReferrals,
        pendingEarnings: affiliate.pendingEarnings,
        paidEarnings: affiliate.paidEarnings,
        availableEarnings,
        isActive: affiliate.isActive,
      },
      referrals: referrals.documents.map((ref) => ({
        referralId: ref.referralId,
        earnings: ref.earnings,
        status: ref.status,
        createdAt: ref.createdAt,
        paidAt: ref.paidAt,
        payoutRequested: referralPayoutMap.get(ref.referralId) || false,
      })),
    });
  } catch (error: any) {
    console.error('Error getting affiliate stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get affiliate stats' },
      { status: 500 }
    );
  }
}
