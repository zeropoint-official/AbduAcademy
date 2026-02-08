import { NextRequest, NextResponse } from 'next/server';
import { chapters, episodes } from '@/lib/appwrite/database';
import { Query } from 'appwrite';
import { getServerUser } from '@/lib/appwrite/server-auth';
import { ID } from 'appwrite';

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

    // Get all chapters ordered by order field
    const { documents } = await chapters.list<{
      $id: string;
      title: string;
      description: string;
      order: number;
      isLocked: boolean;
      createdAt: string;
      updatedAt: string;
    }>([Query.orderAsc('order')]);

    // Get episode counts for each chapter
    const chaptersWithCounts = await Promise.all(
      documents.map(async (chapter) => {
        const { total } = await episodes.list([Query.equal('chapterId', chapter.$id)]);
        return {
          ...chapter,
          episodeCount: total,
        };
      })
    );

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
