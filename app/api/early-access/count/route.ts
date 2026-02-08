import { NextRequest, NextResponse } from 'next/server';
import { payments, Query } from '@/lib/appwrite/database';

interface PaymentDocument {
  $id: string;
  productId: string;
  status: string;
}

const TOTAL_SPOTS = 30;

export async function GET(request: NextRequest) {
  try {
    // Query for completed early access payments
    const result = await payments.list<PaymentDocument>([
      Query.equal('status', 'completed'),
      Query.equal('productId', 'early-access'),
    ]);

    const sold = result.total;
    const remaining = Math.max(0, TOTAL_SPOTS - sold);

    return NextResponse.json({
      sold,
      remaining,
      total: TOTAL_SPOTS,
    });
  } catch (error: any) {
    console.error('Error getting early access count:', error);
    return NextResponse.json(
      { error: 'Failed to get spot count' },
      { status: 500 }
    );
  }
}
