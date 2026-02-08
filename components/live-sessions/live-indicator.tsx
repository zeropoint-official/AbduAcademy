'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radio, Clock, Play } from '@phosphor-icons/react';
import Link from 'next/link';

interface LiveSession {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  isLive: boolean;
  streamUrl?: string;
  joinUrl?: string;
}

export function LiveIndicator() {
  const [session, setSession] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    loadLiveStatus();
    // Refresh every 30 seconds
    const interval = setInterval(loadLiveStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (session && !session.isLive && session.scheduledAt) {
      const updateCountdown = () => {
        const now = new Date().getTime();
        const scheduled = new Date(session.scheduledAt).getTime();
        const diff = scheduled - now;

        if (diff <= 0) {
          setTimeRemaining('');
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else if (minutes > 0) {
          setTimeRemaining(`${minutes}m ${seconds}s`);
        } else {
          setTimeRemaining(`${seconds}s`);
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  async function loadLiveStatus() {
    try {
      const response = await fetch('/api/live-sessions/status');
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
      }
    } catch (error) {
      console.error('Error loading live status:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-muted-foreground text-sm">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Radio className="h-4 w-4 text-muted-foreground" />
            Live Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No live sessions scheduled</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Live Sessions
          </CardTitle>
          {session.isLive && (
            <Badge variant="destructive" className="animate-pulse">
              <span className="h-2 w-2 rounded-full bg-current mr-2" />
              Live Now
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-foreground mb-1">{session.title}</h3>
          {session.description && (
            <p className="text-sm text-muted-foreground">{session.description}</p>
          )}
        </div>

        {session.isLive ? (
          <div className="space-y-2">
            {session.joinUrl ? (
              <Link href={session.joinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-4xl border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 h-9 gap-1.5 px-3 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 w-full">
                <Play className="h-4 w-4 mr-2" weight="fill" />
                Join Live Session
              </Link>
            ) : session.streamUrl ? (
              <Link href={session.streamUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-4xl border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 h-9 gap-1.5 px-3 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 w-full">
                <Play className="h-4 w-4 mr-2" weight="fill" />
                Watch Live Stream
              </Link>
            ) : null}
          </div>
        ) : timeRemaining ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Starts in {timeRemaining}</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Scheduled for {new Date(session.scheduledAt).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
