'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/early-access/pricing-card';
import { CheckCircle } from '@phosphor-icons/react';
import Link from 'next/link';

function EarlyAccessContent() {
  const searchParams = useSearchParams();
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    // Check for success parameter
    if (searchParams.get('success') === 'true') {
      setShowThankYou(true);
      // Remove success param from URL without reload
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated gradient glows */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-20 right-20 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
          <div className="absolute top-1/3 left-10 w-[350px] h-[350px] bg-primary/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
        </div>
      </div>

      <div className="relative z-10">
        {/* Thank You Modal */}
        {showThankYou && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="text-center">
                <div className="mb-4">
                  <CheckCircle className="h-16 w-16 text-primary mx-auto" weight="fill" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-2">Thank You!</h2>
                <p className="text-muted-foreground mb-6">
                  Your payment has been processed successfully. You'll receive an email confirmation shortly.
                </p>
                <Button
                  onClick={() => setShowThankYou(false)}
                  className="w-full"
                  size="lg"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 md:mb-16">
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Early Access Offer
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Secure your spot now with a €19.99 deposit. Pay the remaining €180 next week.
              </p>
            </div>

            {/* Pricing Card */}
            <div className="mb-12">
              <PricingCard />
            </div>

            {/* Additional Info */}
            <div className="text-center space-y-4 mb-12">
              <div className="text-sm text-muted-foreground">
                <p>Secure payment powered by Stripe</p>
                <p className="mt-2">Questions? Contact us at support@abduacademy.com</p>
              </div>
            </div>

            {/* Admin Login Links (Minimal, at bottom) */}
            <div className="mt-16 pt-8 border-t border-border">
              <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Admin Login
                </Link>
                <span>•</span>
                <Link href="/register" className="hover:text-foreground transition-colors">
                  Register
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function EarlyAccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <EarlyAccessContent />
    </Suspense>
  );
}
