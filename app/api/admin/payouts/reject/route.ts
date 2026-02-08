import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/auth';
import { payouts, affiliates } from '@/lib/appwrite/database';
import { Query } from 'appwrite';

interface PayoutDocument {
  $id: string;
  payoutId: string;
  status: string;
  affiliateId: string;
  amount: number;
}

interface AffiliateDocument {
  $id: string;
  pendingEarnings?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { payoutId, rejectionReason } = body;

    if (!payoutId || !rejectionReason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get payout
    const payoutDocs = await payouts.list<PayoutDocument>([Query.equal('payoutId', payoutId)]);
    if (payoutDocs.documents.length === 0) {
      return NextResponse.json(
        { error: 'Payout not found' },
        { status: 404 }
      );
    }

    const payout = payoutDocs.documents[0];

    if (payout.status !== 'requested') {
      return NextResponse.json(
        { error: 'Payout is not in requested status' },
        { status: 400 }
      );
    }

    // Update payout status
    await payouts.update(payout.$id, {
      status: 'rejected',
      rejectionReason,
    });

    // Refund the amount back to available earnings
    try {
      const affiliate = await affiliates.get<AffiliateDocument>(payout.affiliateId);
      await affiliates.update(affiliate.$id, {
        pendingEarnings: Math.max(0, (affiliate.pendingEarnings || 0) - payout.amount),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating affiliate earnings:', error);
      // Continue even if affiliate update fails
    }

    return NextResponse.json({
      message: 'Payout rejected successfully',
    });
  } catch (error: any) {
    console.error('Error rejecting payout:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reject payout' },
      { status: 500 }
    );
  }
}
