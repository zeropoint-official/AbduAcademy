'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TestSpotCounter } from '@/components/admin/test-spot-counter';
import { getCurrentUser } from '@/lib/appwrite/auth';
import type { User } from '@/lib/appwrite/auth';
import { CheckCircle, XCircle, Envelope, CreditCard } from '@phosphor-icons/react';

export default function TestPaymentPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    loadUser();
  }, []);

  async function handleTestWebhook() {
    if (!user) {
      alert('Please log in first');
      return;
    }

    setLoading(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/stripe/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          userEmail: user.email,
          productId: 'test-early-access',
          amount: 1999,
          customerName: user.name || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLastResult({
          success: true,
          message: 'Test webhook processed successfully!',
          details: data,
        });
      } else {
        setLastResult({
          success: false,
          message: data.error || 'Failed to process test webhook',
          details: data,
        });
      }
    } catch (error: any) {
      setLastResult({
        success: false,
        message: error.message || 'Failed to process test webhook',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleTestPayment() {
    if (!user) {
      alert('Please log in first');
      return;
    }

    setLoading(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/admin/test-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          productId: 'test-early-access',
          amount: 1999,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLastResult({
          success: true,
          message: 'Test payment created successfully!',
          details: data,
        });
      } else {
        setLastResult({
          success: false,
          message: data.error || 'Failed to create test payment',
          details: data,
        });
      }
    } catch (error: any) {
      setLastResult({
        success: false,
        message: error.message || 'Failed to create test payment',
      });
    } finally {
      setLoading(false);
    }
  }

  async function checkWebhookStatus() {
    setLoading(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/admin/webhook-status');
      const data = await response.json();

      if (response.ok) {
        setLastResult({
          success: true,
          message: 'Webhook status retrieved',
          details: data,
        });
      } else {
        setLastResult({
          success: false,
          message: data.error || 'Failed to get webhook status',
        });
      }
    } catch (error: any) {
      setLastResult({
        success: false,
        message: error.message || 'Failed to check webhook status',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Payment Testing</h1>
        <p className="text-muted-foreground">
          Test payment processing, counter updates, and email confirmations without affecting real payments.
        </p>
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            <strong>🧪 Test Mode:</strong> All payments created here use the <code className="bg-yellow-500/20 px-1 rounded">test-early-access</code> product ID and are completely separate from real payments.
          </p>
        </div>
      </div>

      {/* Test Counter */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Test Counter</h2>
        <TestSpotCounter />
      </div>

      {/* Test Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Test Webhook Button */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Test Webhook</h3>
              <p className="text-sm text-muted-foreground">
                Simulates a complete Stripe webhook event. This will create a payment record, grant access, send an email, and update the counter.
              </p>
            </div>
          </div>
          <Button
            onClick={handleTestWebhook}
            disabled={loading || !user}
            className="w-full"
            variant="default"
          >
            {loading ? 'Processing...' : 'Test Webhook'}
          </Button>
        </div>

        {/* Test Payment Button */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Test Payment (No Email)</h3>
              <p className="text-sm text-muted-foreground">
                Creates a test payment record directly in Appwrite. Updates counter but does not send email.
              </p>
            </div>
          </div>
          <Button
            onClick={handleTestPayment}
            disabled={loading || !user}
            className="w-full"
            variant="outline"
          >
            {loading ? 'Processing...' : 'Test Payment'}
          </Button>
        </div>

        {/* Webhook Status Button */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Envelope className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Check Webhook Status</h3>
              <p className="text-sm text-muted-foreground">
                Verify webhook and email configuration status.
              </p>
            </div>
          </div>
          <Button
            onClick={checkWebhookStatus}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? 'Checking...' : 'Check Status'}
          </Button>
        </div>

        {/* Test Email Button */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Envelope className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Test Email</h3>
              <p className="text-sm text-muted-foreground">
                Send a test confirmation email to verify Resend is working.
              </p>
            </div>
          </div>
          <Button
            onClick={async () => {
              if (!user) {
                alert('Please log in first');
                return;
              }
              setLoading(true);
              setLastResult(null);
              try {
                const response = await fetch('/api/admin/test-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: user.email }),
                });
                const data = await response.json();
                if (response.ok) {
                  setLastResult({
                    success: true,
                    message: data.message || 'Test email sent successfully!',
                    details: data,
                  });
                } else {
                  setLastResult({
                    success: false,
                    message: data.error || 'Failed to send test email',
                    details: data,
                  });
                }
              } catch (error: any) {
                setLastResult({
                  success: false,
                  message: error.message || 'Failed to send test email',
                });
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || !user}
            className="w-full"
            variant="outline"
          >
            {loading ? 'Sending...' : 'Test Email'}
          </Button>
        </div>
      </div>

      {/* Result Display */}
      {lastResult && (
        <div className={`border rounded-lg p-6 ${
          lastResult.success
            ? 'bg-green-500/10 border-green-500/20'
            : 'bg-red-500/10 border-red-500/20'
        }`}>
          <div className="flex items-start gap-3">
            {lastResult.success ? (
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className={`font-semibold mb-2 ${
                lastResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {lastResult.success ? 'Success' : 'Error'}
              </h3>
              <p className="text-sm mb-3">{lastResult.message}</p>
              {lastResult.details && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    View Details
                  </summary>
                  <pre className="mt-2 p-4 bg-background rounded text-xs overflow-auto">
                    {JSON.stringify(lastResult.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-muted/50 border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-3">How to Test</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Click "Test Webhook" to simulate a complete payment flow (includes email)</li>
          <li>Watch the counter update automatically (polls every 3 seconds)</li>
          <li>Check your email inbox for the confirmation email</li>
          <li>Use "Test Payment" for faster testing without email</li>
          <li>Use "Check Status" to verify webhook and email configuration</li>
        </ol>
        <div className="mt-4 p-3 bg-background rounded border border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Test payments use the <code className="bg-background px-1 rounded">test-early-access</code> product ID and are completely isolated from real payments. The counter above only shows test payments.
          </p>
        </div>
      </div>
    </div>
  );
}
