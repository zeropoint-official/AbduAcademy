// Client-side course data fetching utilities

export interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  isLocked: boolean;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  isLocked: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  attachmentUrls?: string[];
}

/**
 * Get all chapters with episodes
 */
export async function getAllChapters(): Promise<Chapter[]> {
  const response = await fetch('/api/courses');
  if (!response.ok) {
    throw new Error('Failed to fetch chapters');
  }
  const data = await response.json();
  return data.chapters || [];
}

/**
 * Get a chapter by ID
 */
export async function getChapterById(id: string): Promise<Chapter | null> {
  try {
    const response = await fetch(`/api/courses/chapters/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch chapter');
    }
    const data = await response.json();
    return data.chapter || null;
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return null;
  }
}

/**
 * Get an episode by chapter ID and episode ID
 */
export async function getEpisodeById(
  chapterId: string,
  episodeId: string
): Promise<Episode | null> {
  try {
    const response = await fetch(`/api/courses/episodes/${chapterId}/${episodeId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch episode');
    }
    const data = await response.json();
    return data.episode || null;
  } catch (error) {
    console.error('Error fetching episode:', error);
    return null;
  }
}

/**
 * Get all episodes across all chapters
 */
export async function getAllEpisodes(): Promise<Episode[]> {
  const chapters = await getAllChapters();
  return chapters.flatMap((chapter) => chapter.episodes);
}

/**
 * Get the next episode after the current one
 */
export async function getNextEpisode(
  currentEpisodeId: string
): Promise<{ episode: Episode; chapter: Chapter } | null> {
  const allEpisodes = await getAllEpisodes();
  const currentIndex = allEpisodes.findIndex((ep) => ep.id === currentEpisodeId);

  if (currentIndex === -1 || currentIndex === allEpisodes.length - 1) {
    return null;
  }

  const nextEpisode = allEpisodes[currentIndex + 1];
  const chapters = await getAllChapters();
  const chapter = chapters.find((ch) => 
    ch.episodes.some(ep => ep.id === nextEpisode.id)
  );

  if (!chapter) return null;

  return { episode: nextEpisode, chapter };
}

/**
 * Get the previous episode before the current one
 */
export async function getPreviousEpisode(
  currentEpisodeId: string
): Promise<{ episode: Episode; chapter: Chapter } | null> {
  const allEpisodes = await getAllEpisodes();
  const currentIndex = allEpisodes.findIndex((ep) => ep.id === currentEpisodeId);

  if (currentIndex <= 0) {
    return null;
  }

  const prevEpisode = allEpisodes[currentIndex - 1];
  const chapters = await getAllChapters();
  const chapter = chapters.find((ch) => 
    ch.episodes.some(ep => ep.id === prevEpisode.id)
  );

  if (!chapter) return null;

  return { episode: prevEpisode, chapter };
}

/**
 * Get chapter progress (for a user - would need user progress data)
 * This is a placeholder that returns 0 progress
 */
export function getChapterProgress(chapterId: string, episodes: Episode[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = episodes.length;
  // TODO: Integrate with user progress tracking
  const completed = 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

/**
 * Get total course progress
 */
export async function getCourseProgress(): Promise<{
  completed: number;
  total: number;
  percentage: number;
}> {
  const allEpisodes = await getAllEpisodes();
  const total = allEpisodes.length;
  // TODO: Integrate with user progress tracking
  const completed = 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

/**
 * Get total course duration
 */
export function getCourseDuration(episodes: Episode[]): string {
  let totalMinutes = 0;
  let totalSeconds = 0;

  episodes.forEach((ep) => {
    const [mins, secs] = ep.duration.split(':').map(Number);
    totalMinutes += mins;
    totalSeconds += secs;
  });

  totalMinutes += Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Get chapter duration
 */
export function getChapterDuration(episodes: Episode[]): string {
  let totalMinutes = 0;
  let totalSeconds = 0;

  episodes.forEach((ep) => {
    const [mins, secs] = ep.duration.split(':').map(Number);
    totalMinutes += mins;
    totalSeconds += secs;
  });

  totalMinutes += Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}
