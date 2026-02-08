"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { Episode } from "@/lib/courses/api";

interface VideoPlayerProps {
  episode: Episode;
  onComplete?: () => void;
  onProgress?: (progress: { played: number; playedSeconds: number }) => void;
}

export function VideoPlayer({
  episode,
  onComplete,
  onProgress,
}: VideoPlayerProps) {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = episode.videoUrl || '';

  useEffect(() => {
    // Reset states when episode changes
    setIsReady(false);
    setHasError(false);
    setIsPlaying(false);
    
    // Debug logging
    console.log('VideoPlayer - Episode:', {
      id: episode.id,
      title: episode.title,
      videoUrl: videoUrl,
      hasVideoUrl: !!videoUrl,
    });
  }, [episode.id, videoUrl]);

  const handleLoadedData = () => {
    console.log('Video loaded and ready');
    setIsReady(true);
    setHasError(false);
  };

  const handleCanPlay = () => {
    console.log('Video can play');
    setIsReady(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e);
    const video = e.currentTarget;
    const error = video.error;
    if (error) {
      console.error('Video error details:', {
        code: error.code,
        message: error.message,
      });
    }
    setHasError(true);
    setIsReady(false);
  };

  const handleEnded = () => {
    onComplete?.();
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration && onProgress) {
      onProgress({
        played: video.currentTime / video.duration,
        playedSeconds: video.currentTime,
      });
    }
  };

  // Show error state if no video URL or if there's an error
  if (!videoUrl || hasError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative aspect-video bg-card rounded-lg overflow-hidden border border-border shadow-xl flex items-center justify-center"
      >
        <div className="text-center p-8">
          <p className="text-muted-foreground text-sm font-medium mb-2">
            {!videoUrl ? 'No video available' : 'Failed to load video'}
          </p>
          {!videoUrl && (
            <p className="text-xs text-muted-foreground/60">
              Please upload a video for this episode.
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative aspect-video bg-black rounded-lg overflow-hidden border border-border shadow-xl"
    >
      {/* Loading state */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
          <div className="text-center">
            <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground text-sm font-medium">
              Loading video...
            </p>
          </div>
        </div>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full h-full"
        preload="metadata"
        onLoadedData={handleLoadedData}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        Your browser does not support the video tag.
      </video>
    </motion.div>
  );
}
