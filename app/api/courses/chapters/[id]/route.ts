import { NextRequest, NextResponse } from 'next/server';
import { chapters, episodes } from '@/lib/appwrite/database';
import { Query } from 'appwrite';

interface ChapterDocument {
  $id: string;
  title: string;
  description?: string;
  order: number;
  isLocked: boolean;
}

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapter = await chapters.get<ChapterDocument>(id);

    // Get all episodes for this chapter
    const { documents: chapterEpisodes } = await episodes.list<EpisodeDocument>([
      Query.equal('chapterId', id),
      Query.orderAsc('order'),
    ]);

    return NextResponse.json({
      chapter: {
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
