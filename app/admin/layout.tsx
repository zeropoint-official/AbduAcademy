'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout } from '@/lib/appwrite/auth';
import { 
  SquaresFour, 
  CreditCard, 
  Users, 
  Package,
  SignOut,
  TrendUp,
  BookOpen,
  Radio
} from '@phosphor-icons/react';
import { Header } from '@/components/layout/header';
import type { User } from '@/lib/appwrite/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: SquaresFour },
    { href: '/admin/courses', label: 'Courses', icon: BookOpen },
    { href: '/admin/live-sessions', label: 'Live Sessions', icon: Radio },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/affiliates', label: 'Affiliates', icon: TrendUp },
    { href: '/admin/users', label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <aside className="w-64 border-r border-border min-h-[calc(100vh-4rem)] p-6">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" weight={isActive ? 'fill' : 'regular'} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted w-full text-left"
            >
              <SignOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
