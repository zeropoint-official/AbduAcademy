'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Radio } from '@phosphor-icons/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface SessionCardProps {
  title: string;
  description?: string;
  scheduledAt: string;
  isLive: boolean;
  streamUrl?: string;
  joinUrl?: string;
}

export function SessionCard({
  title,
  description,
  scheduledAt,
  isLive,
  streamUrl,
  joinUrl,
}: SessionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Radio className="h-4 w-4" />
            {title}
          </CardTitle>
          {isLive && (
            <Badge variant="destructive" className="animate-pulse">
              <span className="h-2 w-2 rounded-full bg-current mr-2" />
              Live Now
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{new Date(scheduledAt).toLocaleString()}</span>
        </div>
        {isLive && (joinUrl || streamUrl) && (
          <Link
            href={joinUrl || streamUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-4xl border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 h-8 gap-1 px-3 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 w-full"
          >
            <Play className="h-4 w-4 mr-2" weight="fill" />
            {joinUrl ? 'Join Session' : 'Watch Stream'}
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
