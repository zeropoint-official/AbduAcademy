'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SpotCounter } from './spot-counter';
import { getCurrentUser } from '@/lib/appwrite/auth';
import type { User } from '@/lib/appwrite/auth';
import { CheckCircle } from '@phosphor-icons/react';

interface SpotCount {
  sold: number;
  remaining: number;
  total: number;
}

export function PricingCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [remaining, setRemaining] = useState(30);

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setCheckingAuth(false);
    }
    
    loadUser();
  }, []);

  // Listen for spot count updates from SpotCounter via custom event
  useEffect(() => {
    function handleSpotCountUpdate(event: CustomEvent<SpotCount>) {
      setRemaining(event.detail.remaining);
    }

    window.addEventListener('spotCountUpdate' as any, handleSpotCountUpdate as EventListener);
    return () => {
      window.removeEventListener('spotCountUpdate' as any, handleSpotCountUpdate as EventListener);
    };
  }, []);

  const isSoldOut = remaining === 0;

  async function handleCheckout() {
    if (isSoldOut) return;

    // Require authentication first
    if (!user) {
      // Redirect to register page with redirect back to home
      router.push('/register?redirect=/');
      return;
    }

    setLoading(true);
    try {
      if (!user.userId || !user.email) {
        throw new Error('User information is missing. Please try logging in again.');
      }

      // Create checkout session
      const response = await fetch('/api/stripe/create-early-access-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          userEmail: user.email,
          successUrl: `${window.location.origin}/?success=true`,
          cancelUrl: `${window.location.origin}/`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to start checkout. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg">
        {/* Spot Counter */}
        <div className="mb-8">
          <SpotCounter />
        </div>

        {/* Pricing */}
        <div className="text-center mb-6">
          {/* Regular Price - Strikethrough */}
          <div className="mb-3">
            <div className="text-sm text-muted-foreground mb-1">Regular Price</div>
            <div className="text-2xl md:text-3xl font-display font-bold line-through text-muted-foreground">
              €399
            </div>
          </div>

          {/* Early Access Price - Prominent */}
          <div className="mb-4">
            <div className="text-xs text-primary font-medium mb-2 uppercase tracking-wide">
              Early Access Price
            </div>
            <div className="text-5xl md:text-6xl font-display font-bold text-primary mb-2">
              €199
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold">
              <span>Save €200</span>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
            <div className="text-xs text-muted-foreground mb-2 text-center font-medium">
              Payment Plan
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Today:</span>
              <span className="font-medium">€19 deposit</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Next week:</span>
              <span className="font-medium">€180 remaining</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="text-base font-bold text-primary">€199</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" weight="fill" />
            <span className="text-sm">Pay €19 today, €180 next week (total €199)</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" weight="fill" />
            <span className="text-sm">Save €200 vs regular price (€399)</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" weight="fill" />
            <span className="text-sm">Lifetime access - no subscriptions</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" weight="fill" />
            <span className="text-sm">All future updates included</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" weight="fill" />
            <span className="text-sm">
              <span className="font-semibold">Only 30 spots available.</span> After that, price goes up to €399.
            </span>
          </div>
        </div>

        {/* CTA Button */}
        {checkingAuth ? (
          <Button disabled size="lg" className="w-full">
            Checking...
          </Button>
        ) : !user ? (
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/register?redirect=/')}
              size="lg"
              className="w-full"
            >
              Sign Up - Pay €19 Now
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login?redirect=/')}
                className="text-primary hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        ) : (
          <>
            <Button
              onClick={handleCheckout}
              disabled={isSoldOut || loading}
              size="lg"
              className="w-full"
            >
              {loading ? 'Processing...' : isSoldOut ? 'Sold Out' : 'Pay €19 Now - Get Early Access'}
            </Button>
            {isSoldOut && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                All early access spots have been claimed. Thank you for your interest!
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
