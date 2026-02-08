"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Play, CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Chapter } from "@/lib/types";
import { getChapterProgress } from "@/lib/mock-data";
import { getChapterDuration } from "@/lib/courses/api";
import { Progress } from "@/components/ui/progress";

interface ChapterCardProps {
  chapter: Chapter;
  index?: number;
}

export function ChapterCard({ chapter, index = 0 }: ChapterCardProps) {
  const progress = getChapterProgress(chapter.id);
  
  // Calculate duration from episodes array - sum up all episode durations
  const calculateDuration = (episodes: typeof chapter.episodes): string => {
    if (!episodes || episodes.length === 0) return '0m';
    
    let totalMinutes = 0;
    let totalSeconds = 0;

    episodes.forEach((ep) => {
      const duration = ep.duration || '00:00';
      const [mins, secs] = duration.split(':').map(Number);
      totalMinutes += mins || 0;
      totalSeconds += secs || 0;
    });

    totalMinutes += Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const duration = calculateDuration(chapter.episodes);
  const isComplete = progress.percentage === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link href={chapter.isLocked ? "#" : `/course/${chapter.id}`}>
        <div
          className={cn(
            "group relative bg-card border border-border rounded-lg overflow-hidden transition-all duration-300",
            chapter.isLocked
              ? "opacity-60 cursor-not-allowed"
              : "cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
          )}
        >
          {/* Gold top accent line on hover */}
          <div className="absolute top-0 inset-x-0 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div
                className={cn(
                  "h-11 w-11 rounded-lg flex items-center justify-center font-mono text-sm font-semibold transition-all duration-300",
                  chapter.isLocked
                    ? "bg-muted text-muted-foreground/50"
                    : isComplete
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground"
                )}
              >
                {chapter.isLocked ? (
                  <Lock className="h-4 w-4" weight="bold" />
                ) : isComplete ? (
                  <CheckCircle className="h-5 w-5" weight="fill" />
                ) : (
                  String(chapter.order).padStart(2, "0")
                )}
              </div>

              {progress.percentage > 0 && !chapter.isLocked && !isComplete && (
                <span className="text-sm font-mono font-semibold text-primary">
                  {progress.percentage}%
                </span>
              )}
            </div>

            {/* Content */}
            <h3
              className={cn(
                "font-semibold text-base mb-2 transition-colors duration-200 tracking-tight",
                chapter.isLocked
                  ? "text-muted-foreground/50"
                  : "text-foreground group-hover:text-primary"
              )}
            >
              {chapter.title}
            </h3>
            <p className="text-sm text-muted-foreground/70 line-clamp-2 mb-5 leading-relaxed">
              {chapter.description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground/60 mb-4">
              <span className="flex items-center gap-1.5">
                <Play className="h-3.5 w-3.5" weight="fill" />
                {chapter.episodes.length} lessons
              </span>
              <span className="h-3 w-px bg-border" />
              <span className="font-mono">{duration}</span>
            </div>

            {/* Progress bar */}
            {!chapter.isLocked && (
              <Progress value={progress.percentage} className="h-1" />
            )}

            {/* Locked badge */}
            {chapter.isLocked && (
              <div className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-sm inline-block font-medium">
                Premium
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
