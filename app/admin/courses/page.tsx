'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash, Play } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/appwrite/auth';
import type { User } from '@/lib/appwrite/auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChapterForm } from '@/components/admin/chapter-form';

interface Chapter {
  $id: string;
  title: string;
  description: string;
  order: number;
  isLocked: boolean;
  episodeCount?: number;
}

export default function CoursesPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    async function init() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      await loadChapters(currentUser);
    }
    init();
  }, []);

  async function loadChapters(currentUser?: User | null) {
    try {
      const headers: HeadersInit = {};
      if (currentUser) {
        headers['x-user-id'] = currentUser.userId;
      }
      
      const response = await fetch('/api/admin/chapters', { headers });
      if (!response.ok) throw new Error('Failed to load chapters');
      const data = await response.json();
      setChapters(data.chapters || []);
    } catch (error) {
      console.error('Error loading chapters:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(chapter: Chapter) {
    if (!user) {
      alert('Please log in to continue');
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/chapters/${chapter.$id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.userId,
        },
      });
      if (!response.ok) throw new Error('Failed to delete chapter');
      await loadChapters(user);
      setDeletingChapter(null);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      alert('Failed to delete chapter');
    }
  }

  function handleEdit(chapter: Chapter) {
    setEditingChapter(chapter);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingChapter(null);
    loadChapters(user);
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Course Management</h1>
          <p className="text-muted-foreground">Loading chapters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Course Management</h1>
          <p className="text-muted-foreground">Manage chapters and episodes</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Chapter
        </Button>
      </div>

      {showForm && (
        <ChapterForm
          chapter={editingChapter}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-32">Episodes</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-48 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chapters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No chapters yet. Create your first chapter to get started.
                </TableCell>
              </TableRow>
            ) : (
              chapters.map((chapter) => (
                <TableRow key={chapter.$id}>
                  <TableCell className="font-mono">{chapter.order}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{chapter.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {chapter.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-muted-foreground" />
                      <span>{chapter.episodeCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {chapter.isLocked ? (
                      <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                        Locked
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-success/10 text-success">
                        Unlocked
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/courses/${chapter.$id}/episodes`}>
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          Episodes
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(chapter)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingChapter(chapter)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deletingChapter} onOpenChange={() => setDeletingChapter(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingChapter?.title}"? This will also delete
              all episodes in this chapter and their associated files. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingChapter && handleDelete(deletingChapter)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
