'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RegisterForm } from '@/components/auth/register-form';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { Spinner } from '@/components/ui/spinner';

function RegisterContent() {
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
        // User is already logged in, redirect to specified page or homepage
        const redirect = searchParams.get('redirect') || '/';
        router.push(redirect);
        return;
      }
    } catch (error) {
      // Not authenticated, show register page
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
        <main className="container mx-auto px-6 py-12 lg:py-20">
          <div className="flex items-center justify-center min-h-screen">
            <RegisterForm redirectTo={searchParams.get('redirect') || '/'} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
