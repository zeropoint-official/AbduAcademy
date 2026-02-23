import { NextRequest, NextResponse } from 'next/server';
import { chapters, episodes } from '@/lib/appwrite/database';
import { Query, ID } from 'appwrite';
import { getServerUser } from '@/lib/appwrite/server-auth';

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

    // Fetch chapters and all episodes in parallel (2 queries instead of 1+N)
    const [{ documents }, allEpisodes] = await Promise.all([
      chapters.list<{
        $id: string;
        title: string;
        description: string;
        order: number;
        isLocked: boolean;
        createdAt: string;
        updatedAt: string;
      }>([Query.orderAsc('order')]),
      episodes.list<{ chapterId: string }>([Query.limit(5000)]),
    ]);

    // Count episodes per chapter in memory
    const episodeCounts = new Map<string, number>();
    for (const ep of allEpisodes.documents) {
      episodeCounts.set(ep.chapterId, (episodeCounts.get(ep.chapterId) || 0) + 1);
    }

    const chaptersWithCounts = documents.map((chapter) => ({
      ...chapter,
      episodeCount: episodeCounts.get(chapter.$id) || 0,
    }));

    return NextResponse.json({ chapters: chaptersWithCounts });
  } catch (error: any) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chapters' },
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
    const { title, description, order, isLocked } = body;

    if (!title || !description || order === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, order' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const chapter = await chapters.create({
      title,
      description,
      order: Number(order),
      isLocked: isLocked ?? false,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ chapter }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating chapter:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create chapter' },
      { status: 500 }
    );
  }
}
