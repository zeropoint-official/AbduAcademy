// Course and Content Types for Abdu Academy

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  totalChapters: number;
  totalEpisodes: number;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  episodes: Episode[];
  isLocked: boolean;
}

export interface Episode {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl: string;
  order: number;
  isCompleted: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  progress: UserProgress;
}

export interface UserProgress {
  completedEpisodes: string[];
  lastWatchedEpisodeId: string | null;
  lastWatchedChapterId: string | null;
}

// Admin-related types
export interface AdminStats {
  totalChapters: number;
  totalEpisodes: number;
  totalDuration: string;
  totalStudents?: number;
}

// Navigation types
export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

// Form types for admin
export interface ChapterFormData {
  title: string;
  description: string;
  order: number;
  isLocked: boolean;
}

export interface EpisodeFormData {
  title: string;
  description: string;
  duration: string;
  chapterId: string;
  order: number;
  videoUrl: string;
  thumbnailUrl: string;
}
