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
    // Fetch chapters and all episodes in parallel (2 queries instead of 1+N)
    const [{ documents: chaptersList }, { documents: allEpisodes }] = await Promise.all([
      chapters.list<{
        $id: string;
        title: string;
        description: string;
        order: number;
        isLocked: boolean;
        createdAt: string;
        updatedAt: string;
      }>([Query.orderAsc('order')]),
      episodes.list<EpisodeDocument>([Query.orderAsc('order'), Query.limit(5000)]),
    ]);

    // Group episodes by chapter in memory
    const episodesByChapter = new Map<string, EpisodeDocument[]>();
    for (const ep of allEpisodes) {
      const list = episodesByChapter.get(ep.chapterId) || [];
      list.push(ep);
      episodesByChapter.set(ep.chapterId, list);
    }

    const chaptersWithEpisodes = chaptersList.map((chapter) => ({
      id: chapter.$id,
      title: chapter.title,
      description: chapter.description,
      order: chapter.order,
      isLocked: chapter.isLocked,
      episodes: (episodesByChapter.get(chapter.$id) || []).map((ep) => ({
        id: ep.$id,
        chapterId: ep.chapterId,
        title: ep.title,
        description: ep.description,
        duration: ep.duration,
        order: ep.order,
        isLocked: ep.isLocked ?? false,
        thumbnailUrl: ep.thumbnailUrl,
        attachmentUrls: ep.attachmentUrls || [],
      })),
    }));

    return NextResponse.json({ chapters: chaptersWithEpisodes });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
