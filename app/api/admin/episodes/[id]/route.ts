import { NextRequest, NextResponse } from 'next/server';
import { episodes, chapters } from '@/lib/appwrite/database';
import { getServerUser } from '@/lib/appwrite/server-auth';
import { deleteFileByUrl } from '@/lib/r2/client';

interface EpisodeDocument {
  $id: string;
  chapterId: string;
  title: string;
  description?: string;
  duration: string;
  order: number;
  isLocked: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  attachmentUrls?: string[];
}

interface ChapterDocument {
  $id: string;
  isLocked: boolean;
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
    const episode = await episodes.get<EpisodeDocument>(id);

    return NextResponse.json({ episode });
  } catch (error: any) {
    console.error('Error fetching episode:', error);
    if (error.code === 404) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch episode' },
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
    const {
      chapterId,
      title,
      description,
      duration,
      order,
      isLocked,
      videoUrl,
      thumbnailUrl,
      attachmentUrls,
    } = body;

    // Get current episode to check chapter
    const currentEpisode = await episodes.get<EpisodeDocument>(id);
    const effectiveChapterId = chapterId || currentEpisode.chapterId;
    
    // Check if chapter is locked - if so, episodes must be locked
    const chapter = await chapters.get<ChapterDocument>(effectiveChapterId);
    const effectiveIsLocked = chapter.isLocked ? true : (isLocked !== undefined ? Boolean(isLocked) : currentEpisode.isLocked);

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (chapterId !== undefined) updateData.chapterId = chapterId;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = duration;
    if (order !== undefined) updateData.order = Number(order);
    updateData.isLocked = effectiveIsLocked; // Always enforce hierarchical locking
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
    if (attachmentUrls !== undefined) updateData.attachmentUrls = attachmentUrls;

    const episode = await episodes.update(id, updateData);

    return NextResponse.json({ episode });
  } catch (error: any) {
    console.error('Error updating episode:', error);
    if (error.code === 404) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update episode' },
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

    // Get episode to access file URLs
    const episode = await episodes.get<EpisodeDocument>(id);

    // Delete R2 files in parallel
    const deletePromises: Promise<void>[] = [];
    if (episode.videoUrl) {
      deletePromises.push(deleteFileByUrl(episode.videoUrl));
    }
    if (episode.thumbnailUrl) {
      deletePromises.push(deleteFileByUrl(episode.thumbnailUrl));
    }
    if (episode.attachmentUrls && Array.isArray(episode.attachmentUrls)) {
      for (const url of episode.attachmentUrls) {
        deletePromises.push(deleteFileByUrl(url));
      }
    }
    const results = await Promise.allSettled(deletePromises);
    for (const result of results) {
      if (result.status === 'rejected') {
        console.error(`Error deleting R2 file for episode ${id}:`, result.reason);
      }
    }

    // Delete episode
    await episodes.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Episode and associated files deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting episode:', error);
    if (error.code === 404) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete episode' },
      { status: 500 }
    );
  }
}
