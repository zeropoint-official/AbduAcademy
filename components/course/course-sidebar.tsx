'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  User,
  SignOut,
  TrendUp,
  BookOpen,
  Lock,
  CheckCircle,
  Play,
  CaretRight,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { logout } from '@/lib/appwrite/auth';
import { getAllChapters, getChapterProgress } from '@/lib/courses/api';
import type { User as UserType } from '@/lib/appwrite/auth';
import type { Chapter } from '@/lib/courses/api';

interface CourseSidebarProps {
  user: UserType | null;
}

export function CourseSidebar({ user }: CourseSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  const [accountExpanded, setAccountExpanded] = useState(
    pathname.startsWith('/account')
  );

  useEffect(() => {
    async function loadChapters() {
      try {
        const data = await getAllChapters();
        setChapters(data);
      } catch (error) {
        console.error('Error loading chapters:', error);
      } finally {
        setLoading(false);
      }
    }
    loadChapters();
  }, []);

  useEffect(() => {
    // Auto-expand account section if on account page
    if (pathname.startsWith('/account')) {
      setAccountExpanded(true);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Extract current chapter/episode from pathname
  const pathParts = pathname.split('/').filter(Boolean);
  const currentChapterId = pathParts[1] === 'course' && pathParts[2] ? pathParts[2] : undefined;
  const currentEpisodeId = pathParts[3] || undefined;

  const navItems = [
    {
      label: 'Dashboard',
      href: '/course/dashboard',
      icon: BookOpen,
      active: pathname === '/course' || pathname === '/course/dashboard',
    },
    {
      label: 'Affiliates',
      href: '/affiliates',
      icon: TrendUp,
      active: pathname === '/affiliates',
    },
  ];

  const accountItems = [
    {
      label: 'Overview',
      href: '/account/overview',
      active: pathname === '/account' || pathname === '/account/overview',
    },
    {
      label: 'Payments',
      href: '/account/payments',
      active: pathname === '/account/payments',
    },
    {
      label: 'Settings',
      href: '/account/settings',
      active: pathname === '/account/settings',
    },
  ];

  return (
    <aside className="flex flex-col w-72 border-r border-border bg-card h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Link href="/course" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-lg">A</span>
          </div>
          <div>
            <div className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
              Abdu Academy
            </div>
            <div className="text-xs text-muted-foreground font-medium">TRADING</div>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  item.active
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    item.active ? 'text-primary' : 'text-muted-foreground'
                  )}
                  weight={item.active ? 'bold' : 'regular'}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Account Section with Sub-items */}
          <div className="mt-2">
            <button
              onClick={() => setAccountExpanded(!accountExpanded)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                pathname.startsWith('/account')
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
              )}
            >
              <div className="flex items-center gap-3">
                <User
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    pathname.startsWith('/account') ? 'text-primary' : 'text-muted-foreground'
                  )}
                  weight={pathname.startsWith('/account') ? 'bold' : 'regular'}
                />
                <span>Account</span>
              </div>
              <CaretRight
                className={cn(
                  'h-4 w-4 transition-transform',
                  accountExpanded && 'rotate-90'
                )}
              />
            </button>
            {accountExpanded && (
              <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-2">
                {accountItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded text-sm transition-all duration-200',
                      item.active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Course Chapters Section */}
        <div className="px-4 pt-6 pb-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-4">
            Course Content
          </div>
          <div className="space-y-1">
            {loading ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">Loading chapters...</div>
            ) : chapters.length === 0 ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">No chapters available</div>
            ) : (
              chapters.map((chapter) => {
                const isCurrentChapter = chapter.id === currentChapterId;
                const progress = getChapterProgress(chapter.id, chapter.episodes);
                const isComplete = progress.percentage === 100;
                const isLocked = !user?.hasAccess && chapter.isLocked;

              return (
                <div key={chapter.id}>
                  <Link
                    href={isLocked ? '#' : `/course/${chapter.id}`}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200',
                      isCurrentChapter
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent',
                      isLocked && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex-shrink-0">
                      {isLocked ? (
                        <Lock className="h-4 w-4 text-muted-foreground/50" weight="bold" />
                      ) : isComplete ? (
                        <CheckCircle className="h-4 w-4 text-success" weight="fill" />
                      ) : (
                        <span
                          className={cn(
                            'h-6 w-6 rounded text-xs font-mono font-semibold flex items-center justify-center',
                            isCurrentChapter
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {String(chapter.order).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    <span className="truncate flex-1">{chapter.title}</span>
                  </Link>

                  {/* Episode List - Expanded when current chapter */}
                  {isCurrentChapter && !isLocked && (
                    <div className="mt-1 ml-5 pl-4 border-l border-border space-y-0.5">
                      {chapter.episodes.map((episode) => {
                        const isCurrentEpisode = episode.id === currentEpisodeId;

                        return (
                          <Link
                            key={episode.id}
                            href={`/course/${chapter.id}/${episode.id}`}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2 rounded text-sm transition-all duration-200',
                              isCurrentEpisode
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            )}
                          >
                            <Play
                              className={cn(
                                'h-3.5 w-3.5 flex-shrink-0',
                                isCurrentEpisode && 'text-primary-foreground'
                              )}
                              weight={isCurrentEpisode ? 'fill' : 'bold'}
                            />
                            <span className="truncate flex-1 text-xs">{episode.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }))}
          </div>
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <SignOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
