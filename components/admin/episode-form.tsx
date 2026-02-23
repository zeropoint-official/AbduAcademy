'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/appwrite/auth';
import type { User } from '@/lib/appwrite/auth';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Upload, X, File, Image, Video } from '@phosphor-icons/react';
import { Progress } from '@/components/ui/progress';

interface Episode {
  $id: string;
  chapterId: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  isLocked: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  attachmentUrls?: string[];
}

interface EpisodeFormProps {
  chapterId: string;
  chapterIsLocked?: boolean;
  episode?: Episode | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EpisodeForm({ chapterId, chapterIsLocked = false, episode, onClose, onSuccess }: EpisodeFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    loadUser();
  }, []);

  const [formData, setFormData] = useState({
    title: episode?.title || '',
    description: episode?.description || '',
    duration: episode?.duration || '00:00',
    order: episode?.order || 1,
    isLocked: chapterIsLocked ? true : (episode?.isLocked ?? false), // If chapter is locked, episode must be locked
    videoUrl: episode?.videoUrl || '',
    thumbnailUrl: episode?.thumbnailUrl || '',
    attachmentUrls: episode?.attachmentUrls || [] as string[],
  });

  // Update isLocked when chapterIsLocked changes
  useEffect(() => {
    if (chapterIsLocked) {
      setFormData(prev => ({ ...prev, isLocked: true }));
    }
  }, [chapterIsLocked]);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

  async function uploadFile(file: File, fileType: 'video' | 'thumbnail' | 'attachment'): Promise<string> {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Always use presigned URLs to bypass Next.js API route body size limits
    // Generate file key
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    let key: string;
    const effectiveEpisodeId = episode?.$id || `temp_${timestamp}`;

    if (fileType === 'video') {
      key = `videos/${chapterId}/${effectiveEpisodeId}/${timestamp}_${sanitizedFilename}`;
    } else if (fileType === 'thumbnail') {
      const ext = file.name.split('.').pop() || 'jpg';
      key = `thumbnails/${effectiveEpisodeId}/${timestamp}_${effectiveEpisodeId}.${ext}`;
    } else {
      key = `attachments/${effectiveEpisodeId}/${timestamp}_${sanitizedFilename}`;
    }

    try {
      // Step 2: Get presigned URL from our API (small JSON request, no body size limit)
      const presignedResponse = await fetch('/api/admin/upload/presigned', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.userId,
        },
        body: JSON.stringify({
          key,
          contentType: file.type,
          fileType,
          chapterId,
          episodeId: episode?.$id || null,
        }),
      });

      if (!presignedResponse.ok) {
        const error = await presignedResponse.json();
        throw new Error(error.error || 'Failed to get presigned URL');
      }

      const { presignedUrl, publicUrl } = await presignedResponse.json();

      console.log('Presigned URL received:', { presignedUrl: presignedUrl.substring(0, 100) + '...', publicUrl });

      // Step 3: Upload directly to R2 using presigned URL (bypasses Next.js entirely)
      const attemptUpload = (): Promise<string> =>
        new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 100;
              setUploadProgress(percentComplete);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(publicUrl);
            } else {
              const msg = (() => {
                try {
                  const body = xhr.responseText ? JSON.parse(xhr.responseText) : {};
                  return body.error || body.message || body.Code || `Upload failed (${xhr.status})`;
                } catch {
                  return `Upload failed with status ${xhr.status}: ${xhr.statusText}`;
                }
              })();
              console.error('Upload failed:', { status: xhr.status, response: xhr.responseText });
              reject(new Error(msg));
            }
          });

          xhr.addEventListener('error', () => {
            reject(
              new Error(
                `Network error during upload. This may be a CORS issue. ` +
                `Please ensure R2 CORS is configured to allow PUT requests from ${window.location.origin}`
              )
            );
          });

          xhr.addEventListener('abort', () => {
            reject(new Error('Upload was cancelled'));
          });

          try {
            xhr.open('PUT', presignedUrl);
            // Do NOT set Content-Type — the presigned URL is unsigned for
            // content-type so the browser can send the default, avoiding
            // SignatureDoesNotMatch errors with varying MIME detection.
            xhr.send(file);
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            reject(new Error(`Failed to start upload: ${message}`));
          }
        });

      return attemptUpload();
    } catch (error: any) {
      console.error('Presigned URL upload failed:', error);
      throw error;
    }
  }

  async function handleFileUpload(file: File, type: 'video' | 'thumbnail' | 'attachment') {
    setUploading(type);
    setUploadProgress(0);
    
    try {
      const url = await uploadFile(file, type);
      
      if (type === 'video') {
        setFormData({ ...formData, videoUrl: url });
        setVideoFile(null);
      } else if (type === 'thumbnail') {
        setFormData({ ...formData, thumbnailUrl: url });
        setThumbnailFile(null);
      } else {
        setFormData({ ...formData, attachmentUrls: [...formData.attachmentUrls, url] });
        setAttachmentFiles(attachmentFiles.filter(f => f !== file));
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error?.message || 'Failed to upload file';
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(null);
      setUploadProgress(0);
    }
  }

  function handleRemoveAttachment(url: string) {
    setFormData({
      ...formData,
      attachmentUrls: formData.attachmentUrls.filter(u => u !== url),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      alert('Please log in to continue');
      return;
    }
    
    setLoading(true);

    try {
      // Upload files first if needed
      if (videoFile) {
        const url = await uploadFile(videoFile, 'video');
        formData.videoUrl = url;
      }
      if (thumbnailFile) {
        const url = await uploadFile(thumbnailFile, 'thumbnail');
        formData.thumbnailUrl = url;
      }
      for (const file of attachmentFiles) {
        const url = await uploadFile(file, 'attachment');
        formData.attachmentUrls.push(url);
      }

      // Create or update episode
      const url = episode
        ? `/api/admin/episodes/${episode.$id}`
        : '/api/admin/episodes';
      const method = episode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.userId,
        },
        body: JSON.stringify({
          ...formData,
          chapterId,
          userId: user.userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save episode');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving episode:', error);
      alert(error.message || 'Failed to save episode');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{episode ? 'Edit Episode' : 'Create Episode'}</DialogTitle>
          <DialogDescription>
            {episode
              ? 'Update episode details and content below.'
              : 'Create a new episode for this chapter.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., What is Forex Trading?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (MM:SS) *</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="12:34"
                  pattern="[0-9]{1,2}:[0-5][0-9]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what students will learn in this episode..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Order *</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The order in which this episode appears in the chapter
                </p>
              </div>

              {!chapterIsLocked && (
                <div className="space-y-2 flex flex-col justify-end">
                  <div className="flex items-center space-x-2">
                    <input
                      id="isLocked"
                      type="checkbox"
                      checked={formData.isLocked}
                      onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isLocked" className="cursor-pointer">
                      Locked (requires payment)
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Lock this episode for non-paid users
                  </p>
                </div>
              )}
              {chapterIsLocked && (
                <div className="space-y-2 flex flex-col justify-end">
                  <div className="flex items-center space-x-2 opacity-50">
                    <input
                      id="isLocked"
                      type="checkbox"
                      checked={true}
                      disabled
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isLocked" className="cursor-not-allowed text-muted-foreground">
                      Locked (chapter is locked)
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Episodes are automatically locked when the chapter is locked
                  </p>
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div className="space-y-2">
              <Label>Video</Label>
              {formData.videoUrl ? (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Video uploaded</div>
                      <div className="text-xs text-muted-foreground truncate max-w-md">
                        {formData.videoUrl}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, videoUrl: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setVideoFile(file);
                        handleFileUpload(file, 'video');
                      }
                    }}
                  />
                  {uploading === 'video' ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Uploading video...</div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Video className="h-8 w-8 mx-auto text-muted-foreground" />
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => videoInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Video
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        MP4, WebM, or QuickTime
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              {formData.thumbnailUrl ? (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Image className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Thumbnail uploaded</div>
                      <img
                        src={formData.thumbnailUrl}
                        alt="Thumbnail"
                        className="h-16 w-28 object-cover rounded mt-2"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, thumbnailUrl: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setThumbnailFile(file);
                        handleFileUpload(file, 'thumbnail');
                      }
                    }}
                  />
                  {uploading === 'thumbnail' ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Uploading thumbnail...</div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Image className="h-8 w-8 mx-auto text-muted-foreground" />
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => thumbnailInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Thumbnail
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        JPEG, PNG, or WebP
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="space-y-2">
                {formData.attachmentUrls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate max-w-md"
                      >
                        {url.split('/').pop()}
                      </a>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttachment(url)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        setAttachmentFiles([...attachmentFiles, ...files]);
                        files.forEach(file => handleFileUpload(file, 'attachment'));
                      }
                    }}
                  />
                  {uploading === 'attachment' ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Uploading attachment...</div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <File className="h-6 w-6 mx-auto text-muted-foreground" />
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => attachmentInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Add Attachment
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        PDF or Word documents
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading || !!uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !!uploading}>
              {loading ? 'Saving...' : episode ? 'Update Episode' : 'Create Episode'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
