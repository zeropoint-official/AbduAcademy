'use client';

import { useEffect, useState, Suspense } from 'react';
import { CourseSidebar } from '@/components/course/course-sidebar';
import { getCurrentUser } from '@/lib/appwrite/auth';
import type { User } from '@/lib/appwrite/auth';
import { Spinner } from '@/components/ui/spinner';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <CourseSidebar user={user} />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Spinner size="lg" />
          </div>
        }>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
