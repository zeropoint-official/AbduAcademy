'use client';

import { Lock } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface LockedOverlayProps {
  message?: string;
}

export function LockedOverlay({ message = 'This content is locked' }: LockedOverlayProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Lock className="h-16 w-16 text-muted-foreground mx-auto" weight="fill" />
              <div>
                <h3 className="text-lg font-semibold mb-2">{message}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Purchase the course to unlock all content
                </p>
                <Link href="/payment" className="inline-flex items-center justify-center whitespace-nowrap rounded-4xl border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 h-9 gap-1.5 px-3 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50">
                  Get Access for €400
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
