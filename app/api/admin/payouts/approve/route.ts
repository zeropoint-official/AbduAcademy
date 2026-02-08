import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/auth';
import { payouts, affiliates } from '@/lib/appwrite/database';
import { Query } from 'appwrite';

interface PayoutDocument {
  $id: string;
  payoutId: string;
  status: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { payoutId, paymentMethod, adminNotes } = body;

    if (!payoutId || !paymentMethod) {
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
      status: 'approved',
      paymentMethod,
      adminNotes: adminNotes || null,
      approvedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Payout approved successfully',
    });
  } catch (error: any) {
    console.error('Error approving payout:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve payout' },
      { status: 500 }
    );
  }
}
