import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/appwrite/server-auth';
import { payments } from '@/lib/appwrite/database';
import { Query } from 'appwrite';

interface PaymentDocument {
  $id: string;
  paymentId: string;
  userId: string;
  amount: number;
  discountAmount?: number;
  status: string;
  createdAt: string;
  completedAt?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication - get user from header
    const user = await getServerUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get payments for this user, ordered by createdAt desc
    const userPayments = await payments.list<PaymentDocument>([
      Query.equal('userId', user.userId),
      Query.orderDesc('createdAt'),
    ]);

    return NextResponse.json({
      payments: userPayments.documents.map((payment) => ({
        paymentId: payment.paymentId,
        amount: payment.amount,
        discountAmount: payment.discountAmount || 0,
        status: payment.status,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt || null,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching user payments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
