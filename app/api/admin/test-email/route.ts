import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/appwrite/server-auth';
import { sendPaymentConfirmationEmail } from '@/lib/resend/send-email';

/**
 * Admin-only endpoint to test email sending
 * This helps verify Resend configuration is working correctly
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
    const { email = user.email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    console.log('[Test Email] Sending test email to:', email);

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { 
          error: 'RESEND_API_KEY is not configured',
          message: 'Please add RESEND_API_KEY to your environment variables',
        },
        { status: 500 }
      );
    }

    // Send test email
    const result = await sendPaymentConfirmationEmail({
      customerEmail: email,
      customerName: user.name || undefined,
      productName: 'Test Early Access - Abdu Academy (TEST MODE)',
      amount: 1999,
      currency: 'eur',
      purchaseDate: new Date().toISOString(),
      isEarlyAccess: true,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        details: result,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send test email',
          details: result,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Test Email] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to send test email',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
