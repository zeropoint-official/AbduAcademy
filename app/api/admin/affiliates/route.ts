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

    // Batch-fetch affiliates, users, and referrals in parallel (3 queries instead of 1+2N)
    const [{ documents }, allUsers, allReferrals] = await Promise.all([
      affiliates.list<AffiliateDocument>([Query.orderDesc('createdAt')]),
      users.list<UserDocument>([Query.limit(5000)]),
      affiliateReferrals.list<{ affiliateId: string }>([Query.limit(5000)]),
    ]);

    // Build lookup maps
    const userMap = new Map<string, UserDocument>();
    for (const u of allUsers.documents) {
      userMap.set(u.userId, u);
    }

    const referralCounts = new Map<string, number>();
    for (const r of allReferrals.documents) {
      referralCounts.set(r.affiliateId, (referralCounts.get(r.affiliateId) || 0) + 1);
    }

    const enrichedAffiliates = documents.map((affiliate) => {
      const user = userMap.get(affiliate.userId);
      const userEmail = user?.email ?? 'N/A';
      const userName = user?.name || userEmail;

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
        referralCount: referralCounts.get(affiliate.$id) || 0,
      };
    });

    return NextResponse.json({ affiliates: enrichedAffiliates });
  } catch (error: any) {
    console.error('Error fetching affiliates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch affiliates' },
      { status: 500 }
    );
  }
}
