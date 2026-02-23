import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/appwrite/server-auth';
import { payments, users, affiliates, payouts } from '@/lib/appwrite/database';
import { Query } from 'appwrite';

interface PaymentDocument {
  $id: string;
  paymentId: string;
  userId: string;
  amount: number;
  discountAmount?: number;
  affiliateCode?: string;
  status: string;
  createdAt: string;
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

    // Run all independent queries in parallel
    const [completedPayments, usersWithAccess, allUsers, activeAffiliates, pendingPayouts, recentPayments] =
      await Promise.all([
        payments.list<PaymentDocument>([Query.equal('status', 'completed')]),
        users.list([Query.equal('hasAccess', true)]),
        users.list([]),
        affiliates.list([Query.equal('isActive', true)]),
        payouts.list([Query.equal('status', 'requested')]),
        payments.list<PaymentDocument>([Query.orderDesc('createdAt'), Query.limit(10)]),
      ]);

    const totalRevenue = completedPayments.documents.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );
    const totalCustomers = usersWithAccess.total;
    const totalUsers = allUsers.total;
    const activeAffiliatesCount = activeAffiliates.total;
    const pendingPayoutsCount = pendingPayouts.total;

    return NextResponse.json({
      totalRevenue,
      totalCustomers,
      totalUsers,
      activeAffiliates: activeAffiliatesCount,
      pendingPayouts: pendingPayoutsCount,
      recentPayments: recentPayments.documents.map((payment) => ({
        paymentId: payment.paymentId,
        userId: payment.userId,
        amount: payment.amount,
        discountAmount: payment.discountAmount || 0,
        status: payment.status,
        affiliateCode: payment.affiliateCode || null,
        createdAt: payment.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
