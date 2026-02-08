'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getCurrentUser } from '@/lib/appwrite/auth';
import type { User } from '@/lib/appwrite/auth';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verified, setVerified] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    if (sessionId) {
      setVerified(true);
      // Wait a moment for webhook to process, then check user access
      setTimeout(async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setCheckingAccess(false);
        
        // If user has access, redirect to course after a short delay
        if (currentUser?.hasAccess) {
          setTimeout(() => {
            router.push('/course');
          }, 2000);
        }
      }, 2000); // Wait 2 seconds for webhook to process
    }
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {verified ? (
            <>
              <div className="mb-8">
                <CheckCircle className="h-24 w-24 text-primary mx-auto mb-4" weight="fill" />
                <h1 className="text-4xl font-display font-bold mb-4">
                  Payment Successful!
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Your payment has been processed successfully.
                  {checkingAccess ? (
                    <span className="block mt-2 text-sm">Verifying your access...</span>
                  ) : user?.hasAccess ? (
                    <span className="block mt-2 text-sm text-success">✓ You now have lifetime access to the course!</span>
                  ) : (
                    <span className="block mt-2 text-sm text-warning">
                      ⚠ Access is being granted. Please refresh the page in a few seconds.
                    </span>
                  )}
                </p>
              </div>
              {!checkingAccess && user?.hasAccess && (
                <Button onClick={() => router.push('/course')} size="lg">
                  Start Learning
                </Button>
              )}
              {!checkingAccess && !user?.hasAccess && (
                <div className="space-y-3">
                  <Button onClick={() => window.location.reload()} size="lg" variant="outline">
                    Refresh Page
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    If access doesn't appear after refreshing, check the webhook logs or contact support.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div>
              <p className="text-muted-foreground">Verifying payment...</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Verifying payment...</p>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
