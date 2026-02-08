// Mock data for Abdu Academy Forex Mastery Course
// Based on the course structure defined in the PRD

import { Course, Chapter, Episode } from './types';

export const mockCourse: Course = {
  id: 'forex-mastery',
  title: 'Abdu Academy Forex Mastery Course',
  description: 'Master forex trading from fundamentals to advanced strategies. This comprehensive course takes you from complete beginner to confident trader with structured, professional content from industry experts.',
  thumbnail: '/images/course-thumbnail.jpg',
  totalChapters: 5,
  totalEpisodes: 20,
};

// Helper to create episode data
const createEpisode = (
  id: string,
  chapterId: string,
  title: string,
  description: string,
  duration: string,
  order: number
): Episode => ({
  id,
  chapterId,
  title,
  description,
  duration,
  videoUrl: `https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4`,
  thumbnailUrl: `/images/episodes/${id}.jpg`,
  order,
  isCompleted: false,
});

export const mockChapters: Chapter[] = [
  {
    id: 'chapter-1',
    title: 'Forex Fundamentals',
    description: 'Learn the basics of forex trading, understand the market structure, and master essential terminology that every trader needs to know.',
    order: 1,
    isLocked: false,
    episodes: [
      createEpisode(
        'ep-1-1',
        'chapter-1',
        'What is Forex Trading?',
        'Introduction to the foreign exchange market, how it works, and why it\'s the largest financial market in the world.',
        '12:34',
        1
      ),
      createEpisode(
        'ep-1-2',
        'chapter-1',
        'Currency Pairs Explained',
        'Understanding major, minor, and exotic currency pairs. Learn how to read currency pair quotes and what moves them.',
        '15:22',
        2
      ),
      createEpisode(
        'ep-1-3',
        'chapter-1',
        'Market Structure & Sessions',
        'Explore the 24-hour forex market, trading sessions (London, New York, Tokyo, Sydney), and optimal trading times.',
        '18:45',
        3
      ),
      createEpisode(
        'ep-1-4',
        'chapter-1',
        'Key Terminology',
        'Master essential forex terms: pips, lots, leverage, margin, spread, and more. Build your trading vocabulary.',
        '14:18',
        4
      ),
    ],
  },
  {
    id: 'chapter-2',
    title: 'Technical Analysis Basics',
    description: 'Discover the art of reading price charts and identifying patterns. Learn the foundational tools used by professional traders worldwide.',
    order: 2,
    isLocked: false,
    episodes: [
      createEpisode(
        'ep-2-1',
        'chapter-2',
        'Reading Price Charts',
        'Introduction to different chart types: line, bar, and candlestick charts. Learn to interpret price action effectively.',
        '16:42',
        1
      ),
      createEpisode(
        'ep-2-2',
        'chapter-2',
        'Support & Resistance',
        'Identify key price levels where markets tend to pause or reverse. Learn to draw and trade support and resistance zones.',
        '19:15',
        2
      ),
      createEpisode(
        'ep-2-3',
        'chapter-2',
        'Trend Lines & Channels',
        'Master the art of drawing trend lines and channels to identify market direction and potential entry/exit points.',
        '17:33',
        3
      ),
      createEpisode(
        'ep-2-4',
        'chapter-2',
        'Candlestick Patterns',
        'Learn to recognize powerful candlestick patterns: doji, engulfing, hammer, and more. Predict market reversals with confidence.',
        '21:08',
        4
      ),
    ],
  },
  {
    id: 'chapter-3',
    title: 'Trading Strategies',
    description: 'Explore different trading styles and strategies. Find the approach that matches your personality and lifestyle.',
    order: 3,
    isLocked: false,
    episodes: [
      createEpisode(
        'ep-3-1',
        'chapter-3',
        'Scalping Fundamentals',
        'Quick-fire trading for small profits. Learn the skills needed for high-frequency trading on shorter timeframes.',
        '20:45',
        1
      ),
      createEpisode(
        'ep-3-2',
        'chapter-3',
        'Day Trading Strategies',
        'Complete your trades within a single day. Learn intraday setups, entry triggers, and exit strategies.',
        '24:12',
        2
      ),
      createEpisode(
        'ep-3-3',
        'chapter-3',
        'Swing Trading Approach',
        'Capture larger market moves over days to weeks. Perfect for traders who can\'t watch charts all day.',
        '22:30',
        3
      ),
      createEpisode(
        'ep-3-4',
        'chapter-3',
        'Position Trading',
        'Long-term trading strategies for patient investors. Learn to ride major market trends for maximum profit.',
        '18:55',
        4
      ),
    ],
  },
  {
    id: 'chapter-4',
    title: 'Risk Management',
    description: 'Protect your capital and ensure long-term survival in the markets. The most important chapter for any serious trader.',
    order: 4,
    isLocked: false,
    episodes: [
      createEpisode(
        'ep-4-1',
        'chapter-4',
        'Position Sizing',
        'Calculate the perfect trade size based on your account and risk tolerance. Never risk more than you can afford to lose.',
        '16:20',
        1
      ),
      createEpisode(
        'ep-4-2',
        'chapter-4',
        'Stop Loss Strategies',
        'Protect your trades with effective stop losses. Learn different stop placement techniques and when to use them.',
        '19:45',
        2
      ),
      createEpisode(
        'ep-4-3',
        'chapter-4',
        'Risk-Reward Ratios',
        'Understand why risk-reward is crucial for profitability. Learn to identify trades with favorable risk-reward profiles.',
        '15:38',
        3
      ),
      createEpisode(
        'ep-4-4',
        'chapter-4',
        'Psychology of Trading',
        'Master your emotions and develop a winning mindset. Overcome fear, greed, and the common psychological pitfalls.',
        '23:10',
        4
      ),
    ],
  },
  {
    id: 'chapter-5',
    title: 'Live Trading',
    description: 'Put everything together with real-world examples. Watch live trades, learn from analysis, and build your own trading plan.',
    order: 5,
    isLocked: true,
    episodes: [
      createEpisode(
        'ep-5-1',
        'chapter-5',
        'Setting Up Your Platform',
        'Configure your trading platform like a pro. Essential tools, indicators, and workspace optimization.',
        '17:42',
        1
      ),
      createEpisode(
        'ep-5-2',
        'chapter-5',
        'Live Trade Examples',
        'Watch real trades from entry to exit. See the decision-making process in action with detailed commentary.',
        '28:15',
        2
      ),
      createEpisode(
        'ep-5-3',
        'chapter-5',
        'Trade Analysis & Review',
        'Learn to analyze your trades systematically. Keep a trading journal and improve through self-reflection.',
        '20:33',
        3
      ),
      createEpisode(
        'ep-5-4',
        'chapter-5',
        'Building Your Trading Plan',
        'Create a personalized trading plan that fits your goals, risk tolerance, and lifestyle. Your roadmap to success.',
        '25:48',
        4
      ),
    ],
  },
];

// Helper functions for data retrieval and navigation

/**
 * Get all chapters
 */
export function getAllChapters(): Chapter[] {
  return mockChapters;
}

/**
 * Get a chapter by its ID
 */
export function getChapterById(id: string): Chapter | undefined {
  return mockChapters.find((chapter) => chapter.id === id);
}

/**
 * Get an episode by chapter ID and episode ID
 */
export function getEpisodeById(chapterId: string, episodeId: string): Episode | undefined {
  const chapter = getChapterById(chapterId);
  return chapter?.episodes.find((episode) => episode.id === episodeId);
}

/**
 * Get an episode by just the episode ID (searches all chapters)
 */
export function findEpisodeById(episodeId: string): { episode: Episode; chapter: Chapter } | undefined {
  for (const chapter of mockChapters) {
    const episode = chapter.episodes.find((ep) => ep.id === episodeId);
    if (episode) {
      return { episode, chapter };
    }
  }
  return undefined;
}

/**
 * Get all episodes across all chapters
 */
export function getAllEpisodes(): Episode[] {
  return mockChapters.flatMap((chapter) => chapter.episodes);
}

/**
 * Get the next episode after the current one
 * Handles chapter boundaries
 */
export function getNextEpisode(currentEpisodeId: string): { episode: Episode; chapter: Chapter } | null {
  const allEpisodes = getAllEpisodes();
  const currentIndex = allEpisodes.findIndex((ep) => ep.id === currentEpisodeId);
  
  if (currentIndex === -1 || currentIndex === allEpisodes.length - 1) {
    return null;
  }
  
  const nextEpisode = allEpisodes[currentIndex + 1];
  const chapter = mockChapters.find((ch) => ch.id === nextEpisode.chapterId);
  
  if (!chapter) return null;
  
  return { episode: nextEpisode, chapter };
}

/**
 * Get the previous episode before the current one
 * Handles chapter boundaries
 */
export function getPreviousEpisode(currentEpisodeId: string): { episode: Episode; chapter: Chapter } | null {
  const allEpisodes = getAllEpisodes();
  const currentIndex = allEpisodes.findIndex((ep) => ep.id === currentEpisodeId);
  
  if (currentIndex <= 0) {
    return null;
  }
  
  const prevEpisode = allEpisodes[currentIndex - 1];
  const chapter = mockChapters.find((ch) => ch.id === prevEpisode.chapterId);
  
  if (!chapter) return null;
  
  return { episode: prevEpisode, chapter };
}

/**
 * Get chapter progress (for demo, based on isCompleted flag)
 */
export function getChapterProgress(chapterId: string): { completed: number; total: number; percentage: number } {
  const chapter = getChapterById(chapterId);
  if (!chapter) {
    return { completed: 0, total: 0, percentage: 0 };
  }
  
  const completed = chapter.episodes.filter((ep) => ep.isCompleted).length;
  const total = chapter.episodes.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
}

/**
 * Get overall course progress
 */
export function getCourseProgress(): { completed: number; total: number; percentage: number } {
  const allEpisodes = getAllEpisodes();
  const completed = allEpisodes.filter((ep) => ep.isCompleted).length;
  const total = allEpisodes.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
}

/**
 * Get total duration for a chapter
 */
export function getChapterDuration(chapterId: string): string {
  const chapter = getChapterById(chapterId);
  if (!chapter) return '0:00';
  
  let totalMinutes = 0;
  let totalSeconds = 0;
  
  chapter.episodes.forEach((ep) => {
    const [mins, secs] = ep.duration.split(':').map(Number);
    totalMinutes += mins;
    totalSeconds += secs;
  });
  
  totalMinutes += Math.floor(totalSeconds / 60);
  totalSeconds = totalSeconds % 60;
  
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Get total course duration
 */
export function getCourseDuration(): string {
  let totalMinutes = 0;
  let totalSeconds = 0;
  
  getAllEpisodes().forEach((ep) => {
    const [mins, secs] = ep.duration.split(':').map(Number);
    totalMinutes += mins;
    totalSeconds += secs;
  });
  
  totalMinutes += Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  
  return `${hours}h ${mins}m`;
}

// Mock testimonials for landing page
export const mockTestimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Day Trader',
    avatar: '/images/testimonials/avatar-1.jpg',
    quote: 'This course completely transformed my trading. The risk management section alone was worth 10x the price. I went from losing money to consistently profitable in 3 months.',
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Part-time Trader',
    avatar: '/images/testimonials/avatar-2.jpg',
    quote: 'As someone with a full-time job, the swing trading strategies were perfect for me. Clear, actionable content that I could implement immediately.',
  },
  {
    id: '3',
    name: 'David Williams',
    role: 'Forex Beginner',
    avatar: '/images/testimonials/avatar-3.jpg',
    quote: 'I started with zero knowledge of forex. The fundamentals chapter gave me such a solid foundation. Now I understand what I\'m doing and why.',
  },
];

// Course features for landing page
export const courseFeatures = [
  {
    id: '1',
    title: '20+ HD Video Lessons',
    description: 'Professional quality videos with clear explanations and real chart examples.',
    icon: 'play-circle',
  },
  {
    id: '2',
    title: 'Structured Curriculum',
    description: 'From complete beginner to confident trader with a logical progression.',
    icon: 'book-open',
  },
  {
    id: '3',
    title: 'Live Trade Examples',
    description: 'Watch real trades from entry to exit with detailed commentary.',
    icon: 'chart-line',
  },
  {
    id: '4',
    title: 'Lifetime Access',
    description: 'Learn at your own pace with unlimited access to all course materials.',
    icon: 'infinity',
  },
];
