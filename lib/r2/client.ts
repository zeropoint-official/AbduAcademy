import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// R2 configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

function validateR2Config() {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    throw new Error('Missing R2 environment variables. Please check your .env.local file.');
  }
}

// Create S3-compatible R2 client (lazy initialization)
let r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  validateR2Config();
  
  if (!r2Client) {
    if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ACCOUNT_ID) {
      throw new Error('R2 credentials are not configured');
    }
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  
  return r2Client;
}

export interface UploadFileParams {
  file: Buffer | Uint8Array;
  key: string;
  contentType: string;
  metadata?: Record<string, string>;
}

/**
 * Upload a file to R2
 */
export async function uploadFile({
  file,
  key,
  contentType,
  metadata = {},
}: UploadFileParams): Promise<string> {
  validateR2Config();
  const client = getR2Client();
  
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: contentType,
    Metadata: metadata,
  });

  await client.send(command);

  // Return public URL
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Delete a file from R2
 */
export async function deleteFile(key: string): Promise<void> {
  validateR2Config();
  const client = getR2Client();
  
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME!,
    Key: key,
  });

  await client.send(command);
}

/**
 * Delete a file from R2 by its public URL
 */
export async function deleteFileByUrl(url: string): Promise<void> {
  // Extract key from URL
  const urlObj = new URL(url);
  const key = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
  await deleteFile(key);
}

/**
 * Check if a file exists in R2
 */
export async function fileExists(key: string): Promise<boolean> {
  validateR2Config();
  const client = getR2Client();
  
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Get public URL for a file key
 */
export function getPublicUrl(key: string): string {
  validateR2Config();
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Extract key from a public URL
 */
export function extractKeyFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
  } catch {
    // If URL parsing fails, assume it's already a key
    return url;
  }
}

/**
 * Generate a presigned URL for direct client-to-R2 uploads.
 * This bypasses Next.js body size limits by allowing direct uploads.
 *
 * NOTE: We intentionally exclude ContentType from the PutObjectCommand so
 * that the presigned URL signature is not bound to a specific content type.
 * This prevents SignatureDoesNotMatch errors when the browser-reported MIME
 * type differs slightly from what was passed during URL generation (common
 * with video files of varying sizes where browsers may sniff types differently).
 * The client still sends the correct Content-Type header; it just isn't
 * enforced by the signature.
 */
export async function generatePresignedUploadUrl({
  key,
  contentType: _contentType,
  expiresIn = 3600,
  metadata = {},
}: {
  key: string;
  contentType: string;
  expiresIn?: number;
  metadata?: Record<string, string>;
}): Promise<string> {
  validateR2Config();
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME!,
    Key: key,
    Metadata: metadata,
  });

  const presignedUrl = await getSignedUrl(client, command, {
    expiresIn,
    signableHeaders: new Set(['host']),
  });
  return presignedUrl;
}

export { getR2Client as r2Client };
