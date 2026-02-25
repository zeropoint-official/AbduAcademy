import { NextRequest, NextResponse } from 'next/server';
import { episodes, chapters, users, Query } from '@/lib/appwrite/database';
import { getServerClient } from '@/lib/appwrite/config';
import { Users as ServerUsers } from 'node-appwrite';

interface EpisodeDocument {
  $id: string;
  chapterId: string;
  title: string;
  description?: string;
  duration: string;
  order: number;
  isLocked?: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  attachmentUrls?: string[];
}

interface ChapterDocument {
  $id: string;
  isLocked: boolean;
}

interface UserDocument {
  $id: string;
  userId: string;
  hasAccess?: boolean;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string; episodeId: string }> }
) {
  try {
    const { chapterId, episodeId } = await params;
    const episode = await episodes.get<EpisodeDocument>(episodeId);

    const isEpisodeLocked = episode.isLocked ?? false;

    let isChapterLocked = false;
    try {
      const chapter = await chapters.get<ChapterDocument>(chapterId);
      isChapterLocked = chapter.isLocked ?? false;
    } catch {
      // Chapter lookup failed — treat as not locked
    }

    const contentLocked = isEpisodeLocked || isChapterLocked;

    let userHasAccess = false;
    if (contentLocked) {
      const userId = request.headers.get('x-user-id');
      if (userId) {
        try {
          // Check Appwrite Auth labels as the source of truth for access
          const serverClient = getServerClient();
          const serverUsers = new ServerUsers(serverClient);
          const appwriteUser = await serverUsers.get(userId);
          const labels = appwriteUser.labels ?? [];
          if (labels.includes('paid') || labels.includes('admin')) {
            userHasAccess = true;
          }

          // Also grant access if user has admin role in DB
          if (!userHasAccess) {
            const userDocs = await users.list<UserDocument>([Query.equal('userId', userId)]);
            if (userDocs.documents.length > 0 && (userDocs.documents[0] as any).role === 'admin') {
              userHasAccess = true;
            }
          }
        } catch {
          // Access check failed — no access
        }
      }
    }

    const shouldStripVideo = contentLocked && !userHasAccess;

    return NextResponse.json({
      episode: {
        id: episode.$id,
        chapterId: episode.chapterId,
        title: episode.title,
        description: episode.description,
        duration: episode.duration,
        order: episode.order,
        isLocked: isEpisodeLocked,
        videoUrl: shouldStripVideo ? undefined : episode.videoUrl,
        thumbnailUrl: episode.thumbnailUrl,
        attachmentUrls: episode.attachmentUrls || [],
      },
    });
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
