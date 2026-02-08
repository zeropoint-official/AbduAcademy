import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/appwrite/server-auth';
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
    // Check admin access
    const user = await getServerUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Get all live sessions, ordered by scheduledAt desc
    const allSessions = await liveSessions.list<LiveSessionDocument>([
      Query.orderDesc('scheduledAt'),
    ]);

    return NextResponse.json({
      sessions: allSessions.documents.map((session) => ({
        id: session.$id,
        title: session.title,
        description: session.description || null,
        scheduledAt: session.scheduledAt,
        startedAt: session.startedAt || null,
        endedAt: session.endedAt || null,
        isLive: session.isLive,
        streamUrl: session.streamUrl || null,
        joinUrl: session.joinUrl || null,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching live sessions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch live sessions' },
      { status: 500 }
    );
  }
}
