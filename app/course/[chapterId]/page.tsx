"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "motion/react";
import { CaretLeft, Play, Lock, Clock } from "@phosphor-icons/react";
import { EpisodeCard } from "@/components/course/episode-card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  getChapterById,
  getChapterProgress,
  getChapterDuration,
} from "@/lib/courses/api";
import type { Chapter } from "@/lib/courses/api";
import { getCurrentUser } from "@/lib/appwrite/auth";
import type { User } from "@/lib/appwrite/auth";
import { staggerContainer, staggerItem, heroContainer, heroElement } from "@/lib/animations";

interface ChapterPageProps {
  params: Promise<{ chapterId: string }>;
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const { chapterId } = use(params);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChapter() {
      try {
        const [chapterData, currentUser] = await Promise.all([
          getChapterById(chapterId),
          getCurrentUser(),
        ]);
        if (!chapterData) {
          notFound();
          return;
        }
        setChapter(chapterData);
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading chapter:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    loadChapter();
  }, [chapterId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!chapter) {
    notFound();
    return null;
  }

  const progress = getChapterProgress(chapterId, chapter.episodes);
  const duration = getChapterDuration(chapter.episodes);
  const userHasAccess = user?.hasAccess ?? false;
  const isChapterLocked = chapter.isLocked && !userHasAccess;

  if (isChapterLocked) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-24 text-center">
          <motion.div 
            className="max-w-sm mx-auto"
            variants={heroContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div 
              variants={heroElement}
              className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center mx-auto mb-6 border border-border"
            >
              <Lock
                className="h-7 w-7 text-muted-foreground"
                weight="bold"
              />
            </motion.div>
            <motion.h1 
              variants={heroElement}
              className="font-display text-xl text-foreground mb-3 tracking-tight"
            >
              Chapter Locked
            </motion.h1>
            <motion.p 
              variants={heroElement}
              className="text-sm text-muted-foreground mb-8 leading-relaxed"
            >
              {userHasAccess 
                ? 'This chapter is locked. Please contact support if you believe this is an error.'
                : 'Purchase the course to unlock this chapter and all premium content.'}
            </motion.p>
            {!userHasAccess && (
              <motion.div variants={heroElement} className="mb-8">
                <Link href="/payment">
                  <Button size="lg" className="h-11 px-6">
                    Get Access
                  </Button>
                </Link>
              </motion.div>
            )}
            <motion.div variants={heroElement}>
              <Link href="/course">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-5 gap-2"
                >
                  <CaretLeft className="h-4 w-4" weight="bold" />
                  Back to Course
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main */}
      <main className="flex-1 min-w-0">
          {/* Header */}
          <section className="relative border-b border-border">
            <div className="absolute inset-0 bg-hero-gradient opacity-50" />
            <div className="absolute inset-0 bg-grid opacity-30" />

            <div className="px-6 lg:px-10 py-10 relative z-10">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {/* Breadcrumb */}
                <motion.div
                  variants={staggerItem}
                  className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
                >
                  <Link
                    href="/course"
                    className="hover:text-foreground transition-colors duration-200"
                  >
                    Course
                  </Link>
                  <span className="text-border">/</span>
                  <span className="text-foreground truncate">
                    {chapter.title}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.div
                  variants={staggerItem}
                  className="flex items-start gap-5 mb-6"
                >
                  <span className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 text-primary font-mono text-sm font-semibold flex items-center justify-center border border-primary/20">
                    {String(chapter.order).padStart(2, "0")}
                  </span>
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl text-foreground tracking-tight">
                      {chapter.title}
                    </h1>
                    <p className="text-muted-foreground mt-2 leading-relaxed max-w-xl">
                      {chapter.description}
                    </p>
                  </div>
                </motion.div>

                {/* Meta */}
                <motion.div
                  variants={staggerItem}
                  className="flex items-center gap-5 text-sm text-muted-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-primary" weight="fill" />
                    {chapter.episodes.length} lessons
                  </span>
                  <span className="h-4 w-px bg-border" />
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" weight="bold" />
                    {duration}
                  </span>
                </motion.div>

                {/* Progress */}
                <motion.div variants={staggerItem} className="mt-8 max-w-md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">
                      {progress.completed} of {progress.total} completed
                    </span>
                    <span className="text-sm font-mono font-semibold text-primary">
                      {progress.percentage}%
                    </span>
                  </div>
                  <Progress value={progress.percentage} className="h-2" />
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Episodes */}
          <section className="px-6 lg:px-10 py-10">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.h2 
                variants={staggerItem}
                className="text-xs font-semibold text-muted-foreground mb-5 tracking-widest uppercase"
              >
                Lessons
              </motion.h2>
              <div className="space-y-1">
                {chapter.episodes.map((episode, index) => (
                  <EpisodeCard
                    key={episode.id}
                    episode={episode}
                    chapterId={chapterId}
                    index={index}
                    userHasAccess={userHasAccess}
                  />
                ))}
              </div>
            </motion.div>
          </section>
        </main>
    </>
  );
}
