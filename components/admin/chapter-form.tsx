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

interface Chapter {
  $id: string;
  title: string;
  description: string;
  order: number;
  isLocked: boolean;
}

interface ChapterFormProps {
  chapter?: Chapter | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChapterForm({ chapter, onClose, onSuccess }: ChapterFormProps) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    title: chapter?.title || '',
    description: chapter?.description || '',
    order: chapter?.order || 1,
    isLocked: chapter?.isLocked || false,
  });

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    loadUser();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      alert('Please log in to continue');
      return;
    }
    
    setLoading(true);

    try {
      const url = chapter
        ? `/api/admin/chapters/${chapter.$id}`
        : '/api/admin/chapters';
      const method = chapter ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.userId,
        },
        body: JSON.stringify({
          ...formData,
          userId: user.userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save chapter');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving chapter:', error);
      alert(error.message || 'Failed to save chapter');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{chapter ? 'Edit Chapter' : 'Create Chapter'}</DialogTitle>
          <DialogDescription>
            {chapter
              ? 'Update chapter details below.'
              : 'Create a new chapter for your course.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Forex Fundamentals"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what students will learn in this chapter..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Order *</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                required
              />
              <p className="text-xs text-muted-foreground">
                The order in which this chapter appears in the course
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isLocked">Locked</Label>
                <p className="text-xs text-muted-foreground">
                  Locked chapters require course access to view
                </p>
              </div>
              <input
                id="isLocked"
                type="checkbox"
                checked={formData.isLocked}
                onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : chapter ? 'Update Chapter' : 'Create Chapter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
