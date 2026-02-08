import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/auth';
import { affiliates, users, affiliateReferrals } from '@/lib/appwrite/database';
import { Query } from 'appwrite';

interface AffiliateDocument {
  $id: string;
  affiliateId: string;
  code: string;
  userId: string;
  totalEarnings?: number;
  totalReferrals?: number;
  pendingEarnings?: number;
  paidEarnings?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserDocument {
  $id: string;
  userId: string;
  email: string;
  name?: string;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get all affiliates
    const { documents } = await affiliates.list<AffiliateDocument>([
      Query.orderDesc('createdAt'),
    ]);

    // Enrich with user information and stats
    const enrichedAffiliates = await Promise.all(
      documents.map(async (affiliate) => {
        let userEmail = 'N/A';
        let userName = 'N/A';

        try {
          const userDocs = await users.list<UserDocument>([
            Query.equal('userId', affiliate.userId),
          ]);
          if (userDocs.documents.length > 0) {
            userEmail = userDocs.documents[0].email;
            userName = userDocs.documents[0].name || userEmail;
          }
        } catch (error) {
          console.error('Error enriching affiliate data:', error);
        }

        // Get referral count
        const referrals = await affiliateReferrals.list([
          Query.equal('affiliateId', affiliate.$id),
        ]);

        return {
          affiliateId: affiliate.affiliateId,
          code: affiliate.code,
          userId: affiliate.userId,
          userEmail,
          userName,
          totalEarnings: affiliate.totalEarnings || 0,
          totalReferrals: affiliate.totalReferrals || 0,
          pendingEarnings: affiliate.pendingEarnings || 0,
          paidEarnings: affiliate.paidEarnings || 0,
          isActive: affiliate.isActive,
          createdAt: affiliate.createdAt,
          updatedAt: affiliate.updatedAt,
          referralCount: referrals.total,
        };
      })
    );

    return NextResponse.json({ affiliates: enrichedAffiliates });
  } catch (error: any) {
    console.error('Error fetching affiliates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch affiliates' },
      { status: 500 }
    );
  }
}
