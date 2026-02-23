"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle, Lock, Play } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Chapter } from "@/lib/types";
import { getChapterProgress } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  chapters: Chapter[];
  currentChapterId?: string;
  currentEpisodeId?: string;
  className?: string;
}

export function Sidebar({
  chapters,
  currentChapterId,
  currentEpisodeId,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "w-64 border-r border-border bg-card flex flex-col h-full",
        className
      )}
    >

      {/* Chapter List */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {chapters.map((chapter) => {
            const isCurrentChapter = chapter.id === currentChapterId;
            const progress = getChapterProgress(chapter.id);
            const isComplete = progress.percentage === 100;

            return (
              <div key={chapter.id} className="mb-1">
                {/* Chapter Header */}
                <Link
                  href={chapter.isLocked ? "#" : `/course/${chapter.id}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-sm transition-all duration-200 text-sm",
                    isCurrentChapter
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50 border border-transparent",
                    chapter.isLocked && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {chapter.isLocked ? (
                      <Lock
                        className="h-4 w-4 text-muted-foreground/50"
                        weight="bold"
                      />
                    ) : isComplete ? (
                      <CheckCircle
                        className="h-4 w-4 text-success"
                        weight="fill"
                      />
                    ) : (
                      <span
                        className={cn(
                          "h-6 w-6 rounded-sm text-xs font-mono font-semibold flex items-center justify-center",
                          isCurrentChapter
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {String(chapter.order).padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  {/* Chapter Info */}
                  <div className="flex-1 min-w-0">
                    <span
                      className={cn(
                        "block truncate font-medium",
                        chapter.isLocked
                          ? "text-muted-foreground/50"
                          : isCurrentChapter
                          ? "text-primary"
                          : "text-foreground/80"
                      )}
                    >
                      {chapter.title}
                    </span>
                  </div>
                </Link>

                {/* Episode List - Expanded when current chapter */}
                {isCurrentChapter && !chapter.isLocked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-1 ml-5 pl-4 border-l border-border"
                  >
                    {chapter.episodes.map((episode) => {
                      const isCurrentEpisode = episode.id === currentEpisodeId;

                      return (
                        <Link
                          key={episode.id}
                          href={`/course/${chapter.id}/${episode.id}`}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2.5 rounded-sm text-sm transition-all duration-200",
                            isCurrentEpisode
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          {episode.isCompleted && !isCurrentEpisode ? (
                            <CheckCircle
                              className="h-3.5 w-3.5 text-success flex-shrink-0"
                              weight="fill"
                            />
                          ) : (
                            <Play
                              className={cn(
                                "h-3.5 w-3.5 flex-shrink-0",
                                isCurrentEpisode
                                  ? "text-primary-foreground"
                                  : ""
                              )}
                              weight={isCurrentEpisode ? "fill" : "bold"}
                            />
                          )}
                          <span className="truncate flex-1 text-xs">
                            {episode.title}
                          </span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
