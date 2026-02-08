'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { LoginForm } from '@/components/auth/login-form';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { Spinner } from '@/components/ui/spinner';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const user = await getCurrentUser();
      if (user) {
        // User is already logged in, redirect to dashboard
        const redirect = searchParams.get('redirect') || '/course/dashboard';
        router.push(redirect);
        return;
      }
    } catch (error) {
      // Not authenticated, show login page
    } finally {
      setChecking(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-20 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-6 py-12 lg:py-20">
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <LoginForm />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
