import { NextRequest, NextResponse } from 'next/server';
import { chapters, episodes } from '@/lib/appwrite/database';
import { Query } from 'appwrite';
import { getServerUser } from '@/lib/appwrite/server-auth';
import { deleteFileByUrl } from '@/lib/r2/client';

interface ChapterDocument {
  $id: string;
  title: string;
  description?: string;
  order: number;
  isLocked: boolean;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

interface EpisodeDocument {
  $id: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  attachmentUrls?: string[];
}

export async function GET(
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
    const chapter = await chapters.get<ChapterDocument>(id);
    
    // Get all episodes for this chapter
    const { documents: chapterEpisodes } = await episodes.list<EpisodeDocument>([
      Query.equal('chapterId', id),
      Query.orderAsc('order'),
    ]);

    return NextResponse.json({
      chapter: {
        ...chapter,
        episodes: chapterEpisodes,
      },
    });
  } catch (error: any) {
    console.error('Error fetching chapter:', error);
    if (error.code === 404) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chapter' },
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
    const { title, description, order, isLocked } = body;

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = Number(order);
    if (isLocked !== undefined) updateData.isLocked = isLocked;

    const chapter = await chapters.update(id, updateData);

    return NextResponse.json({ chapter });
  } catch (error: any) {
    console.error('Error updating chapter:', error);
    if (error.code === 404) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update chapter' },
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

    // Get all episodes for this chapter to delete their files
    const { documents: chapterEpisodes } = await episodes.list<EpisodeDocument>([
      Query.equal('chapterId', id),
    ]);

    // Delete R2 files for all episodes in parallel
    const deleteFilePromises: Promise<void>[] = [];
    for (const episode of chapterEpisodes) {
      if (episode.videoUrl) {
        deleteFilePromises.push(deleteFileByUrl(episode.videoUrl));
      }
      if (episode.thumbnailUrl) {
        deleteFilePromises.push(deleteFileByUrl(episode.thumbnailUrl));
      }
      if (episode.attachmentUrls && Array.isArray(episode.attachmentUrls)) {
        for (const url of episode.attachmentUrls) {
          deleteFilePromises.push(deleteFileByUrl(url));
        }
      }
    }
    const fileResults = await Promise.allSettled(deleteFilePromises);
    for (const result of fileResults) {
      if (result.status === 'rejected') {
        console.error('Error deleting R2 file:', result.reason);
      }
    }

    // Delete all episodes in parallel
    await Promise.allSettled(
      chapterEpisodes.map((episode) => episodes.delete(episode.$id))
    );

    // Delete chapter
    await chapters.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Chapter and associated episodes deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting chapter:', error);
    if (error.code === 404) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete chapter' },
      { status: 500 }
    );
  }
}
