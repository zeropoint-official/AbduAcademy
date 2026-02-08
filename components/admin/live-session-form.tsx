'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getCurrentUser } from '@/lib/appwrite/auth';
import type { User } from '@/lib/appwrite/auth';

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

interface LiveSessionFormProps {
  session?: LiveSession | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function LiveSessionForm({ session, onClose, onSuccess }: LiveSessionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    title: session?.title || '',
    description: session?.description || '',
    scheduledAt: session?.scheduledAt
      ? new Date(session.scheduledAt).toISOString().slice(0, 16)
      : '',
    streamUrl: session?.streamUrl || '',
    joinUrl: session?.joinUrl || '',
  });

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError('User not authenticated. Please refresh the page and try again.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const url = session
        ? `/api/live-sessions/${session.id}`
        : '/api/live-sessions';
      const method = session ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.userId,
        },
        body: JSON.stringify({
          ...formData,
          scheduledAt: new Date(formData.scheduledAt).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || `Failed to save live session (${response.status})`;
        throw new Error(errorMessage);
      }
      const data = await response.json();
      onSuccess();
    } catch (error: any) {
      console.error('Error saving live session:', error);
      setError(error.message || 'Failed to save live session. Make sure the live_sessions collection exists in Appwrite.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{session ? 'Edit Live Session' : 'Create Live Session'}</DialogTitle>
          <DialogDescription>
            {session
              ? 'Update live session details below.'
              : 'Create a new live session for students to join.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Weekly Q&A Session"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what will be covered in this session..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Scheduled Date & Time *</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="streamUrl">Stream URL (Optional)</Label>
              <Input
                id="streamUrl"
                type="url"
                value={formData.streamUrl}
                onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                URL where students can watch the live stream (YouTube, Twitch, etc.)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="joinUrl">Join URL (Optional)</Label>
              <Input
                id="joinUrl"
                type="url"
                value={formData.joinUrl}
                onChange={(e) => setFormData({ ...formData, joinUrl: e.target.value })}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                URL for students to join the live session (Zoom, Google Meet, etc.)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : session ? 'Save Changes' : 'Create Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
