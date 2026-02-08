import { NextRequest, NextResponse } from 'next/server';
import { episodes, chapters } from '@/lib/appwrite/database';
import { Query } from 'appwrite';
import { getServerUser } from '@/lib/appwrite/server-auth';

interface ChapterDocument {
  $id: string;
  isLocked: boolean;
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

    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');

    const queries: string[] = [];
    if (chapterId) {
      queries.push(Query.equal('chapterId', chapterId));
    }
    queries.push(Query.orderAsc('order'));

    const { documents } = await episodes.list(queries);

    return NextResponse.json({ episodes: documents });
  } catch (error: any) {
    console.error('Error fetching episodes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch episodes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const user = await getServerUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { chapterId, title, description, duration, order, isLocked, videoUrl, thumbnailUrl, attachmentUrls } = body;

    if (!chapterId || !title || !description || !duration || order === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: chapterId, title, description, duration, order' },
        { status: 400 }
      );
    }

    // Check if chapter is locked - if so, episodes must be locked
    const chapter = await chapters.get<ChapterDocument>(chapterId);
    const effectiveIsLocked = chapter.isLocked ? true : (isLocked ?? false);

    const now = new Date().toISOString();
    const episode = await episodes.create({
      chapterId,
      title,
      description,
      duration,
      order: Number(order),
      isLocked: effectiveIsLocked,
      videoUrl: videoUrl || null,
      thumbnailUrl: thumbnailUrl || null,
      attachmentUrls: attachmentUrls || [],
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ episode }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating episode:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create episode' },
      { status: 500 }
    );
  }
}
