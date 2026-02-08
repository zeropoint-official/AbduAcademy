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

    // Get all completed payments
    const completedPayments = await payments.list<PaymentDocument>([
      Query.equal('status', 'completed'),
    ]);

    // Calculate total revenue (sum of all completed payment amounts)
    const totalRevenue = completedPayments.documents.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );

    // Get all users with access
    const usersWithAccess = await users.list([
      Query.equal('hasAccess', true),
    ]);
    const totalCustomers = usersWithAccess.total;

    // Get total users count
    const allUsers = await users.list([]);
    const totalUsers = allUsers.total;

    // Get active affiliates
    const activeAffiliates = await affiliates.list([
      Query.equal('isActive', true),
    ]);
    const activeAffiliatesCount = activeAffiliates.total;

    // Get pending payout requests
    const pendingPayouts = await payouts.list([
      Query.equal('status', 'requested'),
    ]);
    const pendingPayoutsCount = pendingPayouts.total;

    // Get recent payments (last 10, ordered by createdAt desc)
    const recentPayments = await payments.list<PaymentDocument>([
      Query.orderDesc('createdAt'),
      Query.limit(10),
    ]);

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
