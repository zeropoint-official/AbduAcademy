"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CaretLeft,
  CaretRight,
  CheckCircle,
  List,
  X,
  Lock,
} from "@phosphor-icons/react";
import { VideoPlayer } from "@/components/course/video-player";
import { EpisodeCard } from "@/components/course/episode-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  getChapterById,
  getEpisodeById,
  getNextEpisode,
  getPreviousEpisode,
} from "@/lib/courses/api";
import type { Episode, Chapter } from "@/lib/courses/api";
import { getCurrentUser } from "@/lib/appwrite/auth";
import type { User } from "@/lib/appwrite/auth";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface EpisodePageProps {
  params: Promise<{ chapterId: string; episodeId: string }>;
}

export default function EpisodePage({ params }: EpisodePageProps) {
  const { chapterId, episodeId } = use(params);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [nextEp, setNextEp] = useState<{ episode: Episode; chapter: Chapter } | null>(null);
  const [prevEp, setPrevEp] = useState<{ episode: Episode; chapter: Chapter } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEpisode() {
      try {
        const [chapterData, episodeData, nextData, prevData, currentUser] = await Promise.all([
          getChapterById(chapterId),
          getEpisodeById(chapterId, episodeId),
          getNextEpisode(episodeId),
          getPreviousEpisode(episodeId),
          getCurrentUser(),
        ]);

        if (!chapterData || !episodeData) {
          notFound();
          return;
        }

        setChapter(chapterData);
        setEpisode(episodeData);
        setNextEp(nextData);
        setPrevEp(prevData);
        setUser(currentUser);
        
        // Debug logging
        console.log('EpisodePage - Loaded episode:', {
          id: episodeData.id,
          title: episodeData.title,
          videoUrl: episodeData.videoUrl,
          hasVideoUrl: !!episodeData.videoUrl,
          isLocked: episodeData.isLocked,
          userHasAccess: currentUser?.hasAccess ?? false,
        });
      } catch (error) {
        console.error('Error loading episode:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    loadEpisode();
  }, [chapterId, episodeId]);

  if (loading) {
    return (
      <div className="flex-1 flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!chapter || !episode) {
    notFound();
    return null;
  }

  const userHasAccess = user?.hasAccess ?? false;
  const isEpisodeLocked = episode.isLocked && !userHasAccess;
  const isChapterLocked = chapter.isLocked && !userHasAccess;

  // Check if episode or chapter is locked
  if (isEpisodeLocked || isChapterLocked) {
    return (
      <div className="flex-1 flex min-h-screen items-center justify-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-hero-gradient opacity-30" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        
        <div className="max-w-lg mx-auto px-6 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            {/* Lock Icon */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-lg shadow-primary/5"
            >
              <Lock className="h-12 w-12 text-primary" weight="fill" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="font-display text-3xl md:text-4xl text-foreground mb-4 tracking-tight"
            >
              {isChapterLocked ? 'Chapter Locked' : 'Episode Locked'}
            </motion.h1>

            {/* Episode/Chapter Info */}
            {episode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-6"
              >
                <p className="text-lg font-medium text-foreground/90 mb-1">
                  {episode.title}
                </p>
                {chapter && (
                  <p className="text-sm text-muted-foreground">
                    {chapter.title}
                  </p>
                )}
              </motion.div>
            )}

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-base text-muted-foreground mb-10 leading-relaxed max-w-md mx-auto"
            >
              {userHasAccess
                ? 'This content is locked. Please contact support if you believe this is an error.'
                : 'Unlock this content and gain lifetime access to the entire course, including all premium episodes and future updates.'}
            </motion.p>

            {/* Action Buttons */}
            {!userHasAccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="space-y-6"
              >
                <Link href="/payment">
                  <Button 
                    size="lg" 
                    className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  >
                    Get Lifetime Access
                  </Button>
                </Link>
                <div className="pt-2">
                  <Link href={`/course/${chapterId}`}>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full h-11 text-sm border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <CaretLeft className="h-4 w-4 mr-2" weight="bold" />
                      Back to Chapter
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Additional Info */}
            {!userHasAccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-10 pt-8 border-t border-border/50"
              >
                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" weight="fill" />
                    <span>Lifetime Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" weight="fill" />
                    <span>All Episodes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" weight="fill" />
                    <span>Future Updates</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  const handleMarkComplete = () => {
    setIsCompleted(true);
  };

  return (
    <div className="flex-1 flex min-h-screen">
        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Breadcrumb */}
              <motion.div
                variants={staggerItem}
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                  <Link
                    href="/course"
                    className="hover:text-foreground transition-colors duration-200"
                  >
                    Course
                  </Link>
                  <span className="text-border">/</span>
                  <Link
                    href={`/course/${chapterId}`}
                    className="hover:text-foreground transition-colors duration-200 truncate"
                  >
                    {chapter.title}
                  </Link>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden h-9 px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setSidebarOpen(true)}
                >
                  <List className="h-4 w-4" weight="bold" />
                </Button>
              </motion.div>

              {/* Video */}
              <motion.div variants={staggerItem} className="mb-8">
                <VideoPlayer
                  episode={episode}
                  onComplete={() => setIsCompleted(true)}
                />
              </motion.div>

              {/* Info */}
              <motion.div variants={staggerItem} className="mb-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h1 className="font-display text-xl md:text-2xl font-medium text-foreground mb-2 tracking-tight">
                      {episode.title}
                    </h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {episode.description}
                    </p>
                  </div>

                  <Button
                    variant={
                      isCompleted
                        ? "outline"
                        : "default"
                    }
                    size="sm"
                    className={cn(
                      "flex-shrink-0 h-10 gap-2 transition-all duration-300",
                      isCompleted &&
                        "border-success/30 text-success hover:bg-success/10"
                    )}
                    onClick={handleMarkComplete}
                    disabled={isCompleted}
                  >
                    <CheckCircle
                      className="h-4 w-4"
                      weight={
                        isCompleted ? "fill" : "bold"
                      }
                    />
                    {isCompleted ? "Done" : "Complete"}
                  </Button>
                </div>
              </motion.div>

              {/* Navigation */}
              <motion.div
                variants={staggerItem}
                className="flex items-center justify-between gap-4 pt-8 border-t border-border"
              >
                {prevEp ? (
                  <Link
                    href={`/course/${prevEp.chapter.id}/${prevEp.episode.id}`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <CaretLeft className="h-4 w-4" weight="bold" />
                      <span className="hidden sm:inline truncate max-w-[160px] text-sm">
                        {prevEp.episode.title}
                      </span>
                      <span className="sm:hidden text-sm">Previous</span>
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}

                {nextEp ? (
                  <Link
                    href={`/course/${nextEp.chapter.id}/${nextEp.episode.id}`}
                  >
                    <Button
                      size="sm"
                      className="h-10 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-gold-sm"
                    >
                      <span className="hidden sm:inline truncate max-w-[160px] text-sm">
                        {nextEp.episode.title}
                      </span>
                      <span className="sm:hidden text-sm">Next</span>
                      <CaretRight className="h-4 w-4" weight="bold" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/course">
                    <Button
                      size="sm"
                      className="h-10 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-gold-sm"
                    >
                      <span className="text-sm">Finish Course</span>
                      <CheckCircle className="h-4 w-4" weight="bold" />
                    </Button>
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </div>
        </main>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 border-l border-border bg-card">
          <div className="sticky top-[65px] h-[calc(100vh-65px)]">
            <div className="p-5 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground truncate tracking-tight">
                {chapter.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {chapter.episodes.length} lessons
              </p>
            </div>
            <ScrollArea className="h-[calc(100%-73px)]">
              <div className="p-3 space-y-1">
                {chapter.episodes.map((ep, index) => (
                  <EpisodeCard
                    key={ep.id}
                    episode={ep}
                    chapterId={chapterId}
                    isActive={ep.id === episodeId}
                    index={index}
                    userHasAccess={userHasAccess}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                }}
                className="fixed right-0 top-0 bottom-0 w-80 bg-card border-l border-border z-50 lg:hidden"
              >
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate tracking-tight">
                      {chapter.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      {chapter.episodes.length} lessons
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" weight="bold" />
                  </Button>
                </div>
                <ScrollArea className="h-[calc(100%-73px)]">
              <div className="p-3 space-y-1">
                {chapter.episodes.map((ep, index) => (
                  <EpisodeCard
                    key={ep.id}
                    episode={ep}
                    chapterId={chapterId}
                    isActive={ep.id === episodeId}
                    index={index}
                    userHasAccess={userHasAccess}
                  />
                ))}
              </div>
                </ScrollArea>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
    </div>
  );
}
