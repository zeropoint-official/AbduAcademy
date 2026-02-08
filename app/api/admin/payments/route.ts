import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/appwrite/server-auth';
import { payments } from '@/lib/appwrite/database';
import { Query } from 'appwrite';

interface PaymentDocument {
  $id: string;
  paymentId: string;
  userId: string;
  productId: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  amount: number;
  discountAmount?: number;
  affiliateCode?: string;
  affiliateUserId?: string;
  status: string;
  createdAt: string;
  completedAt?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const user = await getServerUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Get all payments, ordered by createdAt desc
    const allPayments = await payments.list<PaymentDocument>([
      Query.orderDesc('createdAt'),
    ]);

    return NextResponse.json({
      payments: allPayments.documents.map((payment) => ({
        paymentId: payment.paymentId,
        userId: payment.userId,
        productId: payment.productId,
        stripeSessionId: payment.stripeSessionId,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        amount: payment.amount,
        discountAmount: payment.discountAmount || 0,
        affiliateCode: payment.affiliateCode || null,
        affiliateUserId: payment.affiliateUserId || null,
        status: payment.status,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt || null,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
