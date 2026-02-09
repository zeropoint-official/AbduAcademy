import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/appwrite/server-auth';
import { STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/config';

/**
 * Admin-only endpoint to check webhook configuration status
 * Helps diagnose webhook issues in production
 */
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

    const webhookSecretConfigured = !!STRIPE_WEBHOOK_SECRET;
    const webhookSecretLength = STRIPE_WEBHOOK_SECRET?.length || 0;
    const resendApiKeyConfigured = !!process.env.RESEND_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'not set';

    // Check if webhook secret looks valid (should start with whsec_)
    const webhookSecretValid = webhookSecretConfigured && STRIPE_WEBHOOK_SECRET?.startsWith('whsec_');

    return NextResponse.json({
      status: 'ok',
      webhook: {
        secretConfigured: webhookSecretConfigured,
        secretValid: webhookSecretValid,
        secretLength: webhookSecretLength,
        expectedPrefix: 'whsec_',
      },
      email: {
        resendApiKeyConfigured,
      },
      environment: {
        appUrl,
        nodeEnv: process.env.NODE_ENV || 'not set',
      },
      recommendations: [
        !webhookSecretConfigured && 'STRIPE_WEBHOOK_SECRET is not set in environment variables',
        webhookSecretConfigured && !webhookSecretValid && 'STRIPE_WEBHOOK_SECRET does not start with "whsec_" - may be invalid',
        !resendApiKeyConfigured && 'RESEND_API_KEY is not set - email confirmations will not work',
        !appUrl.includes('http') && 'NEXT_PUBLIC_APP_URL may not be set correctly',
      ].filter(Boolean),
    });
  } catch (error: any) {
    console.error('[Webhook Status] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check webhook status' },
      { status: 500 }
    );
  }
}
