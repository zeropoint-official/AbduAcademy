'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Lock } from '@phosphor-icons/react';
import Link from 'next/link';
import type { User } from '@/lib/appwrite/auth';

interface AccessStatusProps {
  user: User;
}

export function AccessStatus({ user }: AccessStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Access</CardTitle>
        <CardDescription>Your current access status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.hasAccess ? (
          <>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-primary" weight="fill" />
              <div>
                <p className="font-semibold">You have full access</p>
                <p className="text-sm text-muted-foreground">
                  Purchased on {user.purchaseDate ? new Date(user.purchaseDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <Link href="/course" className="inline-flex items-center justify-center whitespace-nowrap rounded-4xl border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 h-9 gap-1.5 px-3 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50">
              Go to Course
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Lock className="h-8 w-8 text-muted-foreground" weight="fill" />
              <div>
                <p className="font-semibold">No access</p>
                <p className="text-sm text-muted-foreground">
                  Purchase the course to unlock all content
                </p>
              </div>
            </div>
            <Link href="/payment" className="inline-flex items-center justify-center whitespace-nowrap rounded-4xl border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 h-9 gap-1.5 px-3 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50">
              Get Access
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
