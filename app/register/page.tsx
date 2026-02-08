'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { RegisterForm } from '@/components/auth/register-form';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { Spinner } from '@/components/ui/spinner';

export default function RegisterPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const user = await getCurrentUser();
      if (user) {
        // User is already logged in, redirect to dashboard
        router.push('/course/dashboard');
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
        <Header />
        <main className="container mx-auto px-6 py-12 lg:py-20">
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <RegisterForm />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
