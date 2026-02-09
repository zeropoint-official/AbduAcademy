import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/appwrite/server-auth';
import { payments, users } from '@/lib/appwrite/database';
import { ID, Query } from 'appwrite';

interface UserDocument {
  $id: string;
  userId: string;
  email?: string;
  name?: string;
  hasAccess?: boolean;
}

/**
 * Admin-only endpoint to create test payment records directly in Appwrite
 * This bypasses Stripe entirely and allows testing the counter without any payment processing
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const user = await getServerUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, productId = 'test-early-access', amount = 1999 } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    console.log('[Test Payment] Creating test payment record', {
      userId,
      productId,
      amount,
    });

    // Check if user exists
    const userDocs = await users.list<UserDocument>([Query.equal('userId', userId)]);
    if (userDocs.documents.length === 0) {
      return NextResponse.json(
        { error: `User not found with userId: ${userId}` },
        { status: 404 }
      );
    }

    const userDoc = userDocs.documents[0];
    const purchaseDate = new Date().toISOString();

    // Create test payment record
    const paymentId = ID.unique();
    await payments.create({
      paymentId,
      userId,
      productId,
      stripeSessionId: `test_session_${Date.now()}`,
      stripePaymentIntentId: `test_pi_${Date.now()}`,
      amount,
      discountAmount: 0,
      affiliateCode: null,
      affiliateUserId: null,
      status: 'completed',
      createdAt: purchaseDate,
      completedAt: purchaseDate,
    });

    // Grant user access
    const isEarlyAccess = productId === 'early-access' || productId === 'test-early-access';
    await users.update(userDoc.$id, {
      hasAccess: true,
      purchaseDate,
      isEarlyAccess,
      updatedAt: new Date().toISOString(),
    });

    console.log('[Test Payment] Test payment created successfully', {
      paymentId,
      userId,
      productId,
    });

    return NextResponse.json({
      success: true,
      message: 'Test payment created successfully',
      paymentId,
      userId,
      productId,
      amount,
    });
  } catch (error: any) {
    console.error('[Test Payment] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create test payment' },
      { status: 500 }
    );
  }
}
