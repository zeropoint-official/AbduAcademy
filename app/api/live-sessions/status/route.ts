import { NextRequest, NextResponse } from 'next/server';
import { liveSessions } from '@/lib/appwrite/database';
import { Query } from 'appwrite';

interface LiveSessionDocument {
  $id: string;
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

export async function GET(request: NextRequest) {
  try {
    // Get current or upcoming live session
    const now = new Date().toISOString();

    // First, try to find a live session
    const liveSessionDocs = await liveSessions.list<LiveSessionDocument>([
      Query.equal('isLive', true),
      Query.orderDesc('scheduledAt'),
      Query.limit(1),
    ]);

    if (liveSessionDocs.documents.length > 0) {
      const session = liveSessionDocs.documents[0];
      return NextResponse.json({
        session: {
          id: session.$id,
          title: session.title,
          description: session.description || null,
          scheduledAt: session.scheduledAt,
          startedAt: session.startedAt || null,
          endedAt: session.endedAt || null,
          isLive: session.isLive,
          streamUrl: session.streamUrl || null,
          joinUrl: session.joinUrl || null,
        },
      });
    }

    // If no live session, get the next upcoming one
    const upcomingSessions = await liveSessions.list<LiveSessionDocument>([
      Query.greaterThan('scheduledAt', now),
      Query.orderAsc('scheduledAt'),
      Query.limit(1),
    ]);

    if (upcomingSessions.documents.length > 0) {
      const session = upcomingSessions.documents[0];
      return NextResponse.json({
        session: {
          id: session.$id,
          title: session.title,
          description: session.description || null,
          scheduledAt: session.scheduledAt,
          startedAt: session.startedAt || null,
          endedAt: session.endedAt || null,
          isLive: false,
          streamUrl: session.streamUrl || null,
          joinUrl: session.joinUrl || null,
        },
      });
    }

    return NextResponse.json({ session: null });
  } catch (error: any) {
    console.error('Error fetching live session status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch live session status' },
      { status: 500 }
    );
  }
}
