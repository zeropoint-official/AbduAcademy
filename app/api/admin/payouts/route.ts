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

    // Get all payout requests
    const { documents } = await payouts.list<PayoutDocument>([
      Query.orderDesc('requestedAt'),
    ]);

    // Enrich with affiliate and user information
    const enrichedPayouts = await Promise.all(
      documents.map(async (payout) => {
        let affiliateCode = 'N/A';
        let affiliateName = 'N/A';
        let affiliateEmail = 'N/A';
        let affiliateUserId = null;
        let buyerName = 'N/A';
        let buyerEmail = 'N/A';
        let buyerUserId = null;

        try {
          // Get affiliate information
          const affiliate = await affiliates.get<AffiliateDocument>(payout.affiliateId);
          affiliateCode = affiliate.code;
          affiliateUserId = affiliate.userId;

          // Get affiliate owner (the person who owns the affiliate code and requested the payout)
          // Note: affiliate.userId should match payout.requestedBy
          const affiliateUserDocs = await users.list<UserDocument>([
            Query.equal('userId', affiliate.userId),
          ]);
          if (affiliateUserDocs.documents.length > 0) {
            affiliateName = affiliateUserDocs.documents[0].name || affiliateUserDocs.documents[0].email;
            affiliateEmail = affiliateUserDocs.documents[0].email;
          }

          // Get buyer information if referralId exists
          // The buyer is the person who purchased using the affiliate code (different from affiliate owner)
          if (payout.referralId) {
            try {
              const referralDocs = await affiliateReferrals.list<AffiliateReferralDocument>([
                Query.equal('referralId', payout.referralId),
              ]);
              if (referralDocs.documents.length > 0) {
                const referral = referralDocs.documents[0];
                buyerUserId = referral.buyerUserId;
                // Verify buyerUserId is different from affiliateUserId
                if (referral.buyerUserId && referral.buyerUserId !== affiliateUserId) {
                  const buyerUserDocs = await users.list<UserDocument>([
                    Query.equal('userId', referral.buyerUserId),
                  ]);
                  if (buyerUserDocs.documents.length > 0) {
                    buyerName = buyerUserDocs.documents[0].name || buyerUserDocs.documents[0].email;
                    buyerEmail = buyerUserDocs.documents[0].email;
                  }
                } else {
                  // If buyerUserId matches affiliateUserId, this is a self-referral
                  console.warn(`Payout ${payout.payoutId}: buyerUserId (${referral.buyerUserId}) matches affiliateUserId (${affiliateUserId}) - self-referral detected`);
                  buyerName = 'Self-referral';
                  buyerEmail = affiliateEmail; // Same person
                }
              }
            } catch (referralError) {
              console.error('Error fetching referral/buyer data:', referralError);
            }
          } else {
            // No referralId linked - this payout might be for multiple referrals or general earnings
            buyerName = 'Multiple referrals';
          }
        } catch (error) {
          console.error('Error enriching payout data:', error);
        }

        return {
          payoutId: payout.payoutId,
          affiliateId: payout.affiliateId,
          affiliateCode,
          affiliateName,
          affiliateEmail,
          affiliateUserId, // For debugging - should match requestedBy
          requestedBy: payout.requestedBy,
          buyerName,
          buyerEmail,
          buyerUserId, // For debugging - should be different from affiliateUserId
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
      })
    );

    return NextResponse.json({ payouts: enrichedPayouts });
  } catch (error: any) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}
