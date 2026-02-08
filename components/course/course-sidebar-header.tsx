'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gear, SignOut, User as UserIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/appwrite/auth';
import type { User } from '@/lib/appwrite/auth';

interface CourseSidebarHeaderProps {
  user: User | null;
}

export function CourseSidebarHeader({ user }: CourseSidebarHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              Abdu Academy
            </div>
            <div className="text-xs text-muted-foreground">TRADING</div>
          </div>
        </Link>
      </div>

      {user ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground truncate">{user.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => router.push('/account')}
            >
              <Gear className="h-3.5 w-3.5 mr-1.5" />
              Account
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs"
            >
              <SignOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <Link href="/login" className="inline-flex items-center justify-center whitespace-nowrap rounded-4xl border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 h-8 gap-1 px-3 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 w-full">
          Login
        </Link>
      )}
    </div>
  );
}
