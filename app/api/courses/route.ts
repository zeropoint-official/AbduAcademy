import { NextRequest, NextResponse } from 'next/server';
import { chapters, episodes } from '@/lib/appwrite/database';
import { Query } from 'appwrite';

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

export async function GET(request: NextRequest) {
  try {
    // Get all chapters ordered by order field
    const { documents: chaptersList } = await chapters.list<{
      $id: string;
      title: string;
      description: string;
      order: number;
      isLocked: boolean;
      createdAt: string;
      updatedAt: string;
    }>([Query.orderAsc('order')]);

    // Get all episodes grouped by chapter
    const chaptersWithEpisodes = await Promise.all(
      chaptersList.map(async (chapter) => {
        const { documents: chapterEpisodes } = await episodes.list<EpisodeDocument>([
          Query.equal('chapterId', chapter.$id),
          Query.orderAsc('order'),
        ]);

        return {
          id: chapter.$id,
          title: chapter.title,
          description: chapter.description,
          order: chapter.order,
          isLocked: chapter.isLocked,
          episodes: chapterEpisodes.map((ep) => ({
            id: ep.$id,
            chapterId: ep.chapterId,
            title: ep.title,
            description: ep.description,
            duration: ep.duration,
            order: ep.order,
            isLocked: ep.isLocked ?? false,
            videoUrl: ep.videoUrl,
            thumbnailUrl: ep.thumbnailUrl,
            attachmentUrls: ep.attachmentUrls || [],
          })),
        };
      })
    );

    return NextResponse.json({ chapters: chaptersWithEpisodes });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
