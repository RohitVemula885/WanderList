
export type BookmarkStatus = 'planned' | 'visited';

export interface TravelBookmark {
  id: string;
  title: string;
  location: string;
  status: BookmarkStatus;
  coverImage?: string; // Main display image
  images: string[];    // Additional memory photos
  createdAt: number;
  tags: string[];
}

export interface GeminiSuggestion {
  description: string;
  topActivities: string[];
  bestTimeToVisit: string;
}
