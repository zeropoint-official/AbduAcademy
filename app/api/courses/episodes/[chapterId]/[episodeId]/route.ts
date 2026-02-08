import { NextRequest, NextResponse } from 'next/server';
import { episodes } from '@/lib/appwrite/database';

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
  { params }: { params: Promise<{ chapterId: string; episodeId: string }> }
) {
  try {
    const { episodeId } = await params;
    const episode = await episodes.get<EpisodeDocument>(episodeId);

    return NextResponse.json({
      episode: {
        id: episode.$id,
        chapterId: episode.chapterId,
        title: episode.title,
        description: episode.description,
        duration: episode.duration,
        order: episode.order,
        isLocked: episode.isLocked ?? false,
        videoUrl: episode.videoUrl,
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
