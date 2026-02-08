'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash, Play, Stop } from '@phosphor-icons/react';
import { LiveSessionForm } from '@/components/admin/live-session-form';
import { getCurrentUser } from '@/lib/appwrite/auth';
import type { User } from '@/lib/appwrite/auth';
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
  createdAt: string;
  updatedAt: string;
}

export default function AdminLiveSessionsPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [deletingSession, setDeletingSession] = useState<LiveSession | null>(null);
  const [togglingSession, setTogglingSession] = useState<LiveSession | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function init() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        loadSessions(currentUser.userId);
      }
    }
    init();
  }, []);

  async function loadSessions(userId: string) {
    try {
      const response = await fetch('/api/admin/live-sessions', {
        headers: {
          'x-user-id': userId,
        },
      });
      if (!response.ok) throw new Error('Failed to load sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleLive(session: LiveSession) {
    if (!user) return;
    setTogglingSession(session);
    try {
      const response = await fetch(`/api/live-sessions/${session.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.userId,
        },
        body: JSON.stringify({
          isLive: !session.isLive,
          startedAt: !session.isLive ? new Date().toISOString() : session.startedAt,
          endedAt: session.isLive ? new Date().toISOString() : session.endedAt,
        }),
      });
      if (!response.ok) throw new Error('Failed to toggle live status');
      await loadSessions(user.userId);
      setTogglingSession(null);
    } catch (error) {
      console.error('Error toggling live status:', error);
      alert('Failed to toggle live status');
      setTogglingSession(null);
    }
  }

  async function handleDelete(session: LiveSession) {
    if (!user) return;
    try {
      const response = await fetch(`/api/live-sessions/${session.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.userId,
        },
      });
      if (!response.ok) throw new Error('Failed to delete session');
      await loadSessions(user.userId);
      setDeletingSession(null);
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    }
  }

  function handleEdit(session: LiveSession) {
    setEditingSession(session);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingSession(null);
    if (user) {
      loadSessions(user.userId);
    }
  }

  const now = new Date();
  const upcomingSessions = sessions.filter(
    (s) => new Date(s.scheduledAt) > now && !s.endedAt
  );
  const pastSessions = sessions.filter(
    (s) => new Date(s.scheduledAt) <= now || !!s.endedAt
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-64 w-full rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Live Sessions</h1>
          <p className="text-muted-foreground">Manage live sessions for students</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Session
        </Button>
      </div>

      {showForm && (
        <LiveSessionForm
          session={editingSession}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}

      {/* Current/Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming & Current Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.title}</TableCell>
                    <TableCell>
                      {new Date(session.scheduledAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {session.isLive ? (
                        <Badge variant="destructive" className="animate-pulse">
                          <span className="h-2 w-2 rounded-full bg-current mr-2" />
                          Live Now
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Scheduled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleLive(session)}
                          disabled={togglingSession?.id === session.id}
                        >
                          {session.isLive ? (
                            <Stop className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(session)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingSession(session)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Ended</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.title}</TableCell>
                    <TableCell>
                      {new Date(session.scheduledAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {session.endedAt
                        ? new Date(session.endedAt).toLocaleString()
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(session)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingSession(session)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {sessions.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              No live sessions yet. Create your first session to get started.
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={!!deletingSession}
        onOpenChange={() => setDeletingSession(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the live session
              <span className="font-semibold text-foreground">
                {' '}
                {deletingSession?.title}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingSession && handleDelete(deletingSession)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
