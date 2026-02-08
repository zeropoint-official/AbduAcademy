import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUploadUrl, getPublicUrl } from '@/lib/r2/client';
import { getServerUserFromId } from '@/lib/appwrite/server-auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Generate a presigned URL for direct client-to-R2 uploads
 * This bypasses Next.js 10MB body size limit by allowing direct uploads
 */
export async function POST(request: NextRequest) {
  try {
    // Get userId from headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. User ID required in headers.' },
        { status: 401 }
      );
    }
    
    // Check admin access
    const user = await getServerUserFromId(userId);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Parse request body (small JSON, no size limit issue)
    const body = await request.json();
    const { key, contentType, fileType, chapterId, episodeId } = body;

    if (!key || !contentType || !fileType) {
      return NextResponse.json(
        { error: 'Missing required fields: key, contentType, fileType' },
        { status: 400 }
      );
    }

    if (!['video', 'thumbnail', 'attachment'].includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid fileType. Must be "video", "thumbnail", or "attachment"' },
        { status: 400 }
      );
    }

    // Generate metadata
    const metadata: Record<string, string> = {
      uploadedBy: user.userId,
      uploadedAt: new Date().toISOString(),
      fileType,
    };

    if (chapterId) metadata.chapterId = chapterId;
    if (episodeId) metadata.episodeId = episodeId;

    // Generate presigned URL (valid for 1 hour)
    const presignedUrl = await generatePresignedUploadUrl({
      key,
      contentType,
      expiresIn: 3600, // 1 hour
      metadata,
    });

    // Return presigned URL and the final public URL
    const publicUrl = getPublicUrl(key);

    return NextResponse.json({
      success: true,
      presignedUrl,
      publicUrl,
      key,
      expiresIn: 3600,
    });
  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate presigned URL',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
