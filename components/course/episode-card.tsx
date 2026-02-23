"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Play, CheckCircle, Lock } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Episode } from "@/lib/courses/api";

interface EpisodeCardProps {
  episode: Episode;
  chapterId: string;
  isActive?: boolean;
  index?: number;
  userHasAccess?: boolean;
}

export function EpisodeCard({
  episode,
  chapterId,
  isActive = false,
  index = 0,
  userHasAccess = false,
}: EpisodeCardProps) {
  const isLocked = episode.isLocked && !userHasAccess;
  const canAccess = !isLocked;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {canAccess ? (
        <Link href={`/course/${chapterId}/${episode.id}`}>
          <div
            className={cn(
              "group flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted/50 border border-transparent hover:border-border"
            )}
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              <Play
                className={cn(
                  "h-4 w-4 transition-colors duration-200",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground/60 group-hover:text-primary"
                )}
                weight={isActive ? "fill" : "bold"}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm truncate",
                  isActive
                    ? "text-primary-foreground font-medium"
                    : "text-foreground/80"
                )}
              >
                {episode.title}
              </p>
            </div>

            {/* Duration */}
            <span
              className={cn(
                "text-xs flex-shrink-0 font-mono tabular-nums",
                isActive
                  ? "text-primary-foreground/60"
                  : "text-muted-foreground/50"
              )}
            >
              {episode.duration}
            </span>
          </div>
        </Link>
      ) : (
        <div
          className={cn(
            "group flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 opacity-60 cursor-not-allowed",
            "bg-muted/30 border border-border"
          )}
        >
          {/* Lock Icon */}
          <div className="flex-shrink-0">
            <Lock className="h-4 w-4 text-muted-foreground" weight="bold" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate text-muted-foreground">
              {episode.title}
            </p>
          </div>

          {/* Lock Badge */}
          <span className="text-xs flex-shrink-0 px-2 py-0.5 rounded bg-warning/10 text-warning font-medium">
            Locked
          </span>
        </div>
      )}
    </motion.div>
  );
}
