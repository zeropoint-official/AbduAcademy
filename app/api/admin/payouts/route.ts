import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/auth';
import { payouts, affiliates, users, affiliateReferrals } from '@/lib/appwrite/database';
import { Query } from 'appwrite';

interface PayoutDocument {
  $id: string;
  payoutId: string;
  affiliateId: string;
  requestedBy: string;
  amount: number;
  status: string;
  paymentDetails?: any;
  referralId?: string;
  requestedAt: string;
  approvedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;
}

interface AffiliateDocument {
  $id: string;
  code: string;
  userId: string;
}

interface UserDocument {
  $id: string;
  userId: string;
  email: string;
  name?: string;
}

interface AffiliateReferralDocument {
  $id: string;
  referralId: string;
  buyerUserId?: string;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Batch-fetch all data in parallel (4 queries instead of 1+4N)
    const [{ documents }, allAffiliates, allUsers, allReferrals] = await Promise.all([
      payouts.list<PayoutDocument>([Query.orderDesc('requestedAt')]),
      affiliates.list<AffiliateDocument>([Query.limit(5000)]),
      users.list<UserDocument>([Query.limit(5000)]),
      affiliateReferrals.list<AffiliateReferralDocument>([Query.limit(5000)]),
    ]);

    // Build lookup maps
    const affiliateMap = new Map<string, AffiliateDocument>();
    for (const a of allAffiliates.documents) {
      affiliateMap.set(a.$id, a);
    }

    const userMap = new Map<string, UserDocument>();
    for (const u of allUsers.documents) {
      userMap.set(u.userId, u);
    }

    const referralMap = new Map<string, AffiliateReferralDocument>();
    for (const r of allReferrals.documents) {
      referralMap.set(r.referralId, r);
    }

    const enrichedPayouts = documents.map((payout) => {
      let affiliateCode = 'N/A';
      let affiliateName = 'N/A';
      let affiliateEmail = 'N/A';
      let affiliateUserId: string | null = null;
      let buyerName = 'N/A';
      let buyerEmail = 'N/A';
      let buyerUserId: string | null = null;

      const affiliate = affiliateMap.get(payout.affiliateId);
      if (affiliate) {
        affiliateCode = affiliate.code;
        affiliateUserId = affiliate.userId;

        const affiliateUser = userMap.get(affiliate.userId);
        if (affiliateUser) {
          affiliateName = affiliateUser.name || affiliateUser.email;
          affiliateEmail = affiliateUser.email;
        }

        if (payout.referralId) {
          const referral = referralMap.get(payout.referralId);
          if (referral) {
            buyerUserId = referral.buyerUserId ?? null;
            if (referral.buyerUserId && referral.buyerUserId !== affiliateUserId) {
              const buyerUser = userMap.get(referral.buyerUserId);
              if (buyerUser) {
                buyerName = buyerUser.name || buyerUser.email;
                buyerEmail = buyerUser.email;
              }
            } else {
              buyerName = 'Self-referral';
              buyerEmail = affiliateEmail;
            }
          }
        } else {
          buyerName = 'Multiple referrals';
        }
      }

      return {
        payoutId: payout.payoutId,
        affiliateId: payout.affiliateId,
        affiliateCode,
        affiliateName,
        affiliateEmail,
        affiliateUserId,
        requestedBy: payout.requestedBy,
        buyerName,
        buyerEmail,
        buyerUserId,
        amount: payout.amount,
        status: payout.status,
        paymentDetails: payout.paymentDetails,
        referralId: payout.referralId || null,
        requestedAt: payout.requestedAt,
        approvedAt: payout.approvedAt || null,
        completedAt: payout.completedAt || null,
        rejectionReason: payout.rejectionReason || null,
        adminNotes: payout.adminNotes || null,
      };
    });

    return NextResponse.json({ payouts: enrichedPayouts });
  } catch (error: any) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}
