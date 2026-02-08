'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash, Clock, Lock } from '@phosphor-icons/react';
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
import { EpisodeForm } from '@/components/admin/episode-form';

interface Episode {
  $id: string;
  chapterId: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  isLocked: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  attachmentUrls?: string[];
}

interface Chapter {
  $id: string;
  title: string;
  isLocked: boolean;
}

export default function EpisodesPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.chapterId as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [deletingEpisode, setDeletingEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    async function init() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      await loadData(currentUser);
    }
    init();
  }, [chapterId]);

  async function loadData(currentUser?: User | null) {
    try {
      const headers: HeadersInit = {};
      if (currentUser) {
        headers['x-user-id'] = currentUser.userId;
      }
      
      // Load chapter
      const chapterResponse = await fetch(`/api/admin/chapters/${chapterId}`, { headers });
      if (!chapterResponse.ok) throw new Error('Failed to load chapter');
      const chapterData = await chapterResponse.json();
      setChapter(chapterData.chapter);

      // Load episodes
      const episodesResponse = await fetch(`/api/admin/episodes?chapterId=${chapterId}`, { headers });
      if (!episodesResponse.ok) throw new Error('Failed to load episodes');
      const episodesData = await episodesResponse.json();
      setEpisodes(episodesData.episodes || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(episode: Episode) {
    if (!user) {
      alert('Please log in to continue');
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/episodes/${episode.$id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.userId,
        },
      });
      if (!response.ok) throw new Error('Failed to delete episode');
      await loadData(user);
      setDeletingEpisode(null);
    } catch (error) {
      console.error('Error deleting episode:', error);
      alert('Failed to delete episode');
    }
  }

  function handleEdit(episode: Episode) {
    setEditingEpisode(episode);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingEpisode(null);
    loadData(user);
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Chapter not found</h1>
          <Button onClick={() => router.push('/admin/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chapters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/admin/courses">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chapters
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold">{chapter.title}</h1>
            {chapter.isLocked && (
              <span className="text-xs px-2 py-1 rounded bg-warning/10 text-warning flex items-center gap-1">
                <Lock className="h-3 w-3" weight="fill" />
                Chapter Locked
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            {chapter.isLocked 
              ? 'Episodes are automatically locked when the chapter is locked'
              : 'Manage episodes for this chapter'}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Episode
        </Button>
      </div>

      {showForm && (
        <EpisodeForm
          chapterId={chapterId}
          chapterIsLocked={chapter?.isLocked ?? false}
          episode={editingEpisode}
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
              <TableHead className="w-32">Duration</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-32">Video</TableHead>
              <TableHead className="w-48 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {episodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No episodes yet. Create your first episode to get started.
                </TableCell>
              </TableRow>
            ) : (
              episodes.map((episode) => (
                <TableRow key={episode.$id}>
                  <TableCell className="font-mono">{episode.order}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{episode.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {episode.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{episode.duration}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {episode.isLocked ? (
                      <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-warning/10 text-warning">
                        <Lock className="h-3 w-3" weight="fill" />
                        <span>{chapter?.isLocked ? 'Locked (Chapter)' : 'Locked'}</span>
                      </div>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-success/10 text-success">
                        Unlocked
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {episode.videoUrl ? (
                      <span className="text-xs px-2 py-1 rounded bg-success/10 text-success">
                        Uploaded
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                        No video
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(episode)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingEpisode(episode)}
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

      <AlertDialog open={!!deletingEpisode} onOpenChange={() => setDeletingEpisode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Episode</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingEpisode?.title}"? This will also delete
              all associated files (video, thumbnail, attachments) from storage. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingEpisode && handleDelete(deletingEpisode)}
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
