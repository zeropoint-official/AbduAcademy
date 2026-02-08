'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <XCircle className="h-24 w-24 text-red-500 mx-auto mb-4" weight="fill" />
            <h1 className="text-4xl font-display font-bold mb-4">
              Payment Cancelled
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your payment was cancelled. No charges were made.
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push('/payment')}>
              Try Again
            </Button>
            <Button onClick={() => router.push('/')}>
              Go Home
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
