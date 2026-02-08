'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { CheckoutForm } from '@/components/payment/checkout-form';
import { PricingCard } from '@/components/payment/pricing-card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import type { User } from '@/lib/appwrite/auth';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const affiliateCode = searchParams.get('ref') || undefined;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const currentUser = await getCurrentUser();
    if (currentUser?.hasAccess) {
      router.push('/course');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold mb-4">
              Get Lifetime Access
            </h1>
            <p className="text-lg text-muted-foreground">
              Master forex trading with our comprehensive course
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <PricingCard affiliateCode={affiliateCode} />
            <CheckoutForm affiliateCode={affiliateCode} user={user} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
