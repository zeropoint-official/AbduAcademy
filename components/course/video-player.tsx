"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { ArrowClockwise } from "@phosphor-icons/react";
import type { Episode } from "@/lib/courses/api";

interface VideoPlayerProps {
  episode: Episode;
  onComplete?: () => void;
  onProgress?: (progress: { played: number; playedSeconds: number }) => void;
}

const MAX_RETRIES = 3;

export function VideoPlayer({
  episode,
  onComplete,
  onProgress,
}: VideoPlayerProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = episode.videoUrl || '';

  const loadVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;
    video.load();
  }, [videoUrl]);

  useEffect(() => {
    setIsReady(false);
    setHasError(false);
    setRetryCount(0);
  }, [episode.id, videoUrl]);

  const handleCanPlay = () => {
    setIsReady(true);
    setHasError(false);
  };

  const handleError = () => {
    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(1000 * 2 ** retryCount, 8000);
      setRetryCount((c) => c + 1);
      setTimeout(loadVideo, delay);
      return;
    }
    setHasError(true);
    setIsReady(false);
  };

  const handleRetry = () => {
    setHasError(false);
    setRetryCount(0);
    setIsReady(false);
    loadVideo();
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

  if (!videoUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative aspect-video bg-card rounded-lg overflow-hidden border border-border shadow-xl flex items-center justify-center"
      >
        <div className="text-center p-8">
          <p className="text-muted-foreground text-sm font-medium mb-2">
            No video available
          </p>
          <p className="text-xs text-muted-foreground/60">
            Please upload a video for this episode.
          </p>
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
      {/* Loading spinner — visible until video can play, but does NOT block controls */}
      {!isReady && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-card pointer-events-none z-10">
          <div className="text-center">
            <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground text-sm font-medium">
              Loading video...
            </p>
          </div>
        </div>
      )}

      {/* Error overlay with retry */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-card z-20">
          <div className="text-center p-8">
            <p className="text-muted-foreground text-sm font-medium mb-3">
              Failed to load video
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ArrowClockwise className="h-4 w-4" weight="bold" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Video — preload auto for faster playback start */}
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        playsInline
        preload="auto"
        onCanPlay={handleCanPlay}
        onError={handleError}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        className="absolute inset-0 w-full h-full"
      >
        Your browser does not support the video tag.
      </video>
    </motion.div>
  );
}
