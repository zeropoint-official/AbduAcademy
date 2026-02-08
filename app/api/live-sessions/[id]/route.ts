import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/appwrite/server-auth';
import { liveSessions } from '@/lib/appwrite/database';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await liveSessions.get<LiveSessionDocument>(id);

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
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching live session:', error);
    if (error.code === 404) {
      return NextResponse.json({ error: 'Live session not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch live session' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    const user = await getServerUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, scheduledAt, startedAt, endedAt, isLive, streamUrl, joinUrl } = body;

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt;
    if (startedAt !== undefined) updateData.startedAt = startedAt;
    if (endedAt !== undefined) updateData.endedAt = endedAt;
    if (isLive !== undefined) updateData.isLive = isLive;
    if (streamUrl !== undefined) updateData.streamUrl = streamUrl;
    if (joinUrl !== undefined) updateData.joinUrl = joinUrl;

    const session = await liveSessions.update<LiveSessionDocument>(id, updateData);

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
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error updating live session:', error);
    if (error.code === 404) {
      return NextResponse.json({ error: 'Live session not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update live session' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    const user = await getServerUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await liveSessions.delete(id);

    return NextResponse.json({ success: true, message: 'Live session deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting live session:', error);
    if (error.code === 404) {
      return NextResponse.json({ error: 'Live session not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete live session' },
      { status: 500 }
    );
  }
}
