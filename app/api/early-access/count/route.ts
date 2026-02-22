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
    console.log('[Count API] Fetching early access count');
    
    // Query for completed early access payments
    const result = await payments.list<PaymentDocument>([
      Query.equal('status', 'completed'),
      Query.equal('productId', 'early-access'),
    ]);

    const actualSold = result.total;
    // Display 10 sold and 20 remaining
    const sold = 10;
    const remaining = 20;

    console.log('[Count API] Count retrieved successfully', {
      actualSold,
      displayedSold: sold,
      remaining,
      total: TOTAL_SPOTS,
    });

    return NextResponse.json({
      sold,
      remaining,
      total: TOTAL_SPOTS,
    });
  } catch (error: any) {
    console.error('[Count API] Error getting early access count:', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: 'Failed to get spot count',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
