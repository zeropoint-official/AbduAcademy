import { NextRequest, NextResponse } from 'next/server';
import { payments, Query } from '@/lib/appwrite/database';

interface PaymentDocument {
  $id: string;
  productId: string;
  status: string;
}

const TOTAL_SPOTS = 30;

/**
 * Test counter endpoint - uses 'test-early-access' product ID
 * This is separate from the real counter and only for testing
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Test Count API] Fetching test early access count');
    
    // Query for completed test early access payments
    const result = await payments.list<PaymentDocument>([
      Query.equal('status', 'completed'),
      Query.equal('productId', 'test-early-access'),
    ]);

    const sold = result.total;
    const remaining = Math.max(0, TOTAL_SPOTS - sold);

    console.log('[Test Count API] Test count retrieved successfully', {
      sold,
      remaining,
      total: TOTAL_SPOTS,
    });

    return NextResponse.json({
      sold,
      remaining,
      total: TOTAL_SPOTS,
    });
  } catch (error: any) {
    console.error('[Test Count API] Error getting test early access count:', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: 'Failed to get test spot count',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
