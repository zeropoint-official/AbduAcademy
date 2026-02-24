'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { CheckoutForm } from '@/components/payment/checkout-form';
import { PricingCard } from '@/components/payment/pricing-card';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, UserCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { BlurFade } from '@/components/ui/blur-fade';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/lib/appwrite/auth';

export function PricingSection() {
  const searchParams = useSearchParams();
  const affiliateCode = searchParams.get('ref') || undefined;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoFinalPrice, setPromoFinalPrice] = useState<number | null>(null);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    }
    loadUser();
  }, []);

  const handlePromoApplied = useCallback((_code: string | null, finalPrice: number | null) => {
    setPromoFinalPrice(finalPrice);
  }, []);

  if (loading) {
    return (
      <section id="pricing" className="py-20 lg:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </section>
    );
  }

  if (user?.hasAccess) {
    return (
      <section id="pricing" className="py-20 lg:py-28">
        <div className="container mx-auto px-6">
          <BlurFade delay={0.1} inView>
            <div className="max-w-md mx-auto text-center p-8 bg-card border border-border rounded-xl">
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" weight="fill" />
              <h2 className="text-2xl font-display font-bold mb-2">You Have Access</h2>
              <p className="text-muted-foreground mb-6">
                You already have lifetime access to the course.
              </p>
              <Link href="/course">
                <Button size="lg" className="w-full">
                  Go to Course
                </Button>
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <BlurFade delay={0.1} inView>
          <div className="text-center mb-12">
            <span className="text-sm text-primary font-medium tracking-widest uppercase mb-4 block">
              Get Started Today
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
              Get Lifetime Access
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One payment. No subscriptions. No hidden fees. Lifetime access to everything.
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.2} inView>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <PricingCard affiliateCode={affiliateCode} promoFinalPrice={promoFinalPrice} />
            {user ? (
              <CheckoutForm affiliateCode={affiliateCode} user={user} onPromoApplied={handlePromoApplied} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Create an Account to Purchase</CardTitle>
                  <CardDescription>You need to be logged in before you can buy the course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <UserCircle className="h-16 w-16 text-muted-foreground" weight="thin" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Your course access will be linked to your account. Register or log in to proceed with the purchase.
                  </p>
                  <div className="space-y-3">
                    <Link href="/register?redirect=/payment">
                      <Button size="lg" className="w-full">
                        Create Account
                      </Button>
                    </Link>
                    <Link href="/login?redirect=/payment">
                      <Button size="lg" variant="outline" className="w-full">
                        Already have an account? Log In
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
