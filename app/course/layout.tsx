'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CourseSidebar } from '@/components/course/course-sidebar';
import { getCurrentUser } from '@/lib/appwrite/auth';
import type { User } from '@/lib/appwrite/auth';
import { Spinner } from '@/components/ui/spinner';

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      router.push('/login?redirect=/course/dashboard');
      return;
    }
    if (!currentUser.hasAccess && currentUser.role !== 'admin') {
      router.push('/payment');
      return;
    }
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
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <CourseSidebar user={user} />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
