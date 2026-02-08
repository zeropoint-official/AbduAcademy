import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, getPublicUrl } from '@/lib/r2/client';
import { getServerUserFromId } from '@/lib/appwrite/server-auth';

// Configure route to accept large file uploads
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for large uploads
export const dynamic = 'force-dynamic'; // Ensure dynamic rendering

// File type validation
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB

export async function POST(request: NextRequest) {
  try {
    // Get userId from headers first (before parsing FormData)
    // IMPORTANT: We must get userId from headers because parsing FormData consumes the request body
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

    // Now we can safely parse FormData (body hasn't been consumed)
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string; // 'video', 'thumbnail', 'attachment'
    const chapterId = formData.get('chapterId') as string | null;
    const episodeId = formData.get('episodeId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!fileType || !['video', 'thumbnail', 'attachment'].includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid fileType. Must be "video", "thumbnail", or "attachment"' },
        { status: 400 }
      );
    }

    // Validate file type
    const contentType = file.type;
    let isValidType = false;
    
    if (fileType === 'video') {
      isValidType = ALLOWED_VIDEO_TYPES.includes(contentType);
    } else if (fileType === 'thumbnail') {
      isValidType = ALLOWED_IMAGE_TYPES.includes(contentType);
    } else if (fileType === 'attachment') {
      isValidType = ALLOWED_DOCUMENT_TYPES.includes(contentType);
    }

    if (!isValidType) {
      return NextResponse.json(
        { error: `Invalid file type for ${fileType}. Allowed types: ${fileType === 'video' ? ALLOWED_VIDEO_TYPES.join(', ') : fileType === 'thumbnail' ? ALLOWED_IMAGE_TYPES.join(', ') : ALLOWED_DOCUMENT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate required IDs based on file type
    // Note: episodeId might be null when creating a new episode, so we use a temporary ID
    if (fileType === 'video' && !chapterId) {
      return NextResponse.json(
        { error: 'chapterId is required for video uploads' },
        { status: 400 }
      );
    }

    // For new episodes, use a temporary episodeId (will be updated after episode creation)
    const effectiveEpisodeId = episodeId || `temp_${Date.now()}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate file key based on type
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    let key: string;

    if (fileType === 'video') {
      key = `videos/${chapterId}/${effectiveEpisodeId}/${timestamp}_${sanitizedFilename}`;
    } else if (fileType === 'thumbnail') {
      const ext = file.name.split('.').pop() || 'jpg';
      key = `thumbnails/${effectiveEpisodeId}/${timestamp}_${effectiveEpisodeId}.${ext}`;
    } else {
      key = `attachments/${effectiveEpisodeId}/${timestamp}_${sanitizedFilename}`;
    }

    // Upload to R2
    const publicUrl = await uploadFile({
      file: buffer,
      key,
      contentType,
      metadata: {
        originalName: file.name,
        uploadedBy: user.userId,
        uploadedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key,
      size: file.size,
      contentType,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: error.message || 'Failed to upload file',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
