'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Play, TrendUp, Lock, CurrencyDollar, ChatCircle, PaperPlaneTilt } from '@phosphor-icons/react';
import { ChapterCard } from '@/components/course/chapter-card';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { getAllChapters, getCourseProgress, getCourseDuration, getAllEpisodes } from '@/lib/courses/api';
import type { Chapter } from '@/lib/courses/api';
import { staggerContainer, staggerItem, heroContainer, heroElement, heroTitle } from '@/lib/animations';
import type { User } from '@/lib/appwrite/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Radio } from '@phosphor-icons/react';

interface AffiliateStats {
  hasAffiliate: boolean;
  affiliate?: {
    code: string;
    totalEarnings: number;
    totalReferrals: number;
    availableEarnings: number;
  };
}

export default function CourseDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [courseDuration, setCourseDuration] = useState('0m');
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(null);
  const [session, setSession] = useState<{
    id: string;
    title: string;
    scheduledAt: string;
    isLive: boolean;
    joinUrl?: string;
    streamUrl?: string;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    async function init() {
      await checkAccess();
      await loadCourseData();
      await loadAffiliateStats();
      await loadLiveSession();
    }
    init();
    
    // Refresh live session every 30 seconds
    const interval = setInterval(loadLiveSession, 30000);
    return () => clearInterval(interval);
  }, []);

  async function checkAccess() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  async function loadCourseData() {
    try {
      const [chaptersData, progress, allEpisodes] = await Promise.all([
        getAllChapters(),
        getCourseProgress(),
        getAllEpisodes(),
      ]);
      setChapters(chaptersData);
      setCourseProgress(progress);
      setCourseDuration(getCourseDuration(allEpisodes));
      setLoading(false);
    } catch (error) {
      console.error('Error loading course data:', error);
      setLoading(false);
    }
  }

  async function loadAffiliateStats() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;
      
      const response = await fetch('/api/affiliates/stats', {
        headers: {
          'x-user-id': currentUser.userId,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAffiliateStats(data);
      }
    } catch (error) {
      console.error('Error loading affiliate stats:', error);
    }
  }

  async function loadLiveSession() {
    try {
      const response = await fetch('/api/live-sessions/status');
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
      }
    } catch (error) {
      console.error('Error loading live session:', error);
    }
  }

  useEffect(() => {
    if (session && !session.isLive && session.scheduledAt) {
      const updateCountdown = () => {
        const now = new Date().getTime();
        const scheduled = new Date(session.scheduledAt).getTime();
        const diff = scheduled - now;

        if (diff <= 0) {
          setTimeRemaining('');
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else if (minutes > 0) {
          setTimeRemaining(`${minutes}m ${seconds}s`);
        } else {
          setTimeRemaining(`${seconds}s`);
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const hasAccess = user?.hasAccess ?? false;
  const completedChapters = chapters.filter(
    (chapter) => chapter.episodes.some(ep => ep.id) // Placeholder - would check user progress
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative border-b border-border">
        <div className="absolute inset-0 bg-hero-gradient opacity-50" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 noise-overlay" />

        <div className="px-6 lg:px-10 py-12 lg:py-16 relative z-10">
          <motion.div
            variants={heroContainer}
            initial="initial"
            animate="animate"
            className="max-w-4xl"
          >
            {/* Title & Description */}
            <motion.h1
              variants={heroTitle}
              className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4"
            >
              Abdu Academy Forex Mastery Course
            </motion.h1>
            <motion.p
              variants={heroElement}
              className="text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed"
            >
              Master forex trading from fundamentals to advanced strategies. This comprehensive course takes you from complete beginner to confident trader with structured, professional content from industry experts.
            </motion.p>

            {/* Stats Row */}
            <motion.div
              variants={heroElement}
              className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-10"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" weight="bold" />
                <span className="font-mono">{chapters.length}</span> chapters
              </span>
              <span className="h-4 w-px bg-border" />
              <span className="flex items-center gap-2">
                <Play className="h-4 w-4 text-primary" weight="fill" />
                <span className="font-mono">{courseProgress.total}</span> lessons
              </span>
              <span className="h-4 w-px bg-border" />
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" weight="bold" />
                {courseDuration}
              </span>
            </motion.div>

            {/* Progress Card */}
            <motion.div
              variants={heroElement}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <TrendUp className="h-5 w-5 text-primary" weight="bold" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Your Progress</h3>
                    <p className="text-xs text-muted-foreground">
                      {courseProgress.completed} of {courseProgress.total} lessons completed
                    </p>
                  </div>
                </div>
                <span className="font-mono text-2xl font-semibold text-primary">
                  {courseProgress.percentage}%
                </span>
              </div>
              <Progress value={courseProgress.percentage} className="h-2" />
            </motion.div>

            {/* Access Status */}
            {!hasAccess && (
              <motion.div
                variants={heroElement}
                className="mt-6 bg-muted/50 border border-border rounded-lg p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-5 w-5 text-warning" weight="bold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      Course Access Required
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Purchase the course to unlock all chapters and start your trading journey.
                    </p>
                    <Link href="/payment" className="inline-flex items-center justify-center whitespace-nowrap rounded-4xl border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 h-9 gap-1.5 px-3 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50">
                      Get Access for €399
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Live Sessions, Affiliate, Discord & Telegram Cards */}
            <motion.div
              variants={heroElement}
              className="mt-6 grid sm:grid-cols-2 gap-4"
            >
              {/* Live Session Indicator */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Radio className="h-5 w-5 text-primary" weight="bold" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Live Sessions</h3>
                      <p className="text-xs text-muted-foreground">
                        {session?.isLive ? 'Session in progress' : session ? 'Upcoming session' : 'No sessions scheduled'}
                      </p>
                    </div>
                  </div>
                </div>
                {session ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">{session.title}</p>
                    {session.isLive ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                          <span className="text-xs text-destructive font-medium">Live Now</span>
                        </div>
                        {(session.joinUrl || session.streamUrl) && (
                          <Link href={session.joinUrl || session.streamUrl || '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-4xl border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 h-8 gap-1 px-3 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50">
                            <Play className="h-3 w-3 mr-1" weight="fill" />
                            Join
                          </Link>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {timeRemaining ? `Starts in ${timeRemaining}` : `Scheduled for ${new Date(session.scheduledAt).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No live sessions scheduled</p>
                )}
              </div>

              {/* Affiliate Stats */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <TrendUp className="h-5 w-5 text-primary" weight="bold" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Affiliate Earnings</h3>
                      <p className="text-xs text-muted-foreground">
                        {affiliateStats?.hasAffiliate ? 'Your referral stats' : 'Start earning today'}
                      </p>
                    </div>
                  </div>
                  {affiliateStats?.hasAffiliate && (
                    <Link href="/affiliates" className="inline-flex items-center justify-center whitespace-nowrap rounded-4xl border border-transparent hover:bg-muted hover:text-foreground h-8 gap-1 px-3 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50">
                      View Full
                    </Link>
                  )}
                </div>
                {affiliateStats?.hasAffiliate && affiliateStats.affiliate ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total</p>
                      <p className="text-base font-bold">
                        €{(affiliateStats.affiliate.totalEarnings / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Referrals</p>
                      <p className="text-base font-bold">{affiliateStats.affiliate.totalReferrals}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Available</p>
                      <p className="text-base font-bold text-primary">
                        €{(affiliateStats.affiliate.availableEarnings / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Start earning by sharing your affiliate code
                    </p>
                    <Link href="/affiliates" className="inline-flex items-center justify-center whitespace-nowrap rounded-4xl border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 h-8 gap-1 px-3 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 w-full">
                      Create Affiliate Code
                    </Link>
                  </div>
                )}
              </div>

              {/* Discord Group */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <ChatCircle className="h-5 w-5 text-primary" weight="bold" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Discord Community</h3>
                      <p className="text-xs text-muted-foreground">Join our trading community</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Connect with fellow traders, share strategies, and get support
                  </p>
                  <Link href="https://discord.gg/abduacademy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-4xl border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 h-8 gap-1 px-3 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 w-full">
                    <ChatCircle className="h-4 w-4 mr-2" weight="fill" />
                    Join Discord
                  </Link>
                </div>
              </div>

              {/* Telegram Group */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <PaperPlaneTilt className="h-5 w-5 text-primary" weight="bold" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Telegram Group</h3>
                      <p className="text-xs text-muted-foreground">Get instant updates</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Receive trading signals, market updates, and community announcements
                  </p>
                  <Link href="https://t.me/abduacademy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-4xl border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 h-8 gap-1 px-3 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 w-full">
                    <PaperPlaneTilt className="h-4 w-4 mr-2" weight="fill" />
                    Join Telegram
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Chapters Grid */}
      <section className="py-10 lg:py-16">
        <div className="px-6 lg:px-10">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.div
              variants={staggerItem}
              className="flex items-center justify-between mb-10"
            >
              <h2 className="font-display text-2xl md:text-3xl tracking-tight">Chapters</h2>
              <span className="text-sm text-muted-foreground font-mono">
                {chapters.length} total
              </span>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {chapters.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No chapters available yet. Check back soon!
                </div>
              ) : (
                chapters.map((chapter, index) => {
                  const shouldShowLocked = !hasAccess && chapter.isLocked;

                  return (
                    <ChapterCard
                      key={chapter.id}
                      chapter={{
                        id: chapter.id,
                        title: chapter.title,
                        description: chapter.description,
                        order: chapter.order,
                        isLocked: shouldShowLocked,
                        episodes: chapter.episodes.map(ep => ({ 
                          ...ep, 
                          isCompleted: false,
                          videoUrl: ep.videoUrl || '',
                          thumbnailUrl: ep.thumbnailUrl || '',
                          attachmentUrls: ep.attachmentUrls || [],
                        })),
                      }}
                      index={index}
                    />
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
