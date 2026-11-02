// types/razy.ts

export type ContentKind = 'movie' | 'series' | 'anime' | 'short_drama' | 'trailer' | 'live';
export type AccessTier = 'free' | 'vip' | 'rental';

export interface CastMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
}

export interface VideoSource {
  quality: 'auto' | '2160p' | '1080p' | '720p' | '480p';
  url: string;
  codec?: string;
  isDrmProtected?: boolean;
}

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  src: string;
  isDefault?: boolean;
}

export interface AudioTrack {
  id: string;
  language: string;
  label: string;
}

export interface Episode {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  synopsis: string;
  duration: number; // in seconds
  thumbnailUrl: string;
  streamUrl: string;
  introStartTime?: number;
  introEndTime?: number;
}

export interface MediaItem {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  kind: ContentKind;
  tier: AccessTier;
  releaseYear: number;
  ratingScore: number;
  contentRating: 'G' | 'PG' | 'PG-13' | 'TV-MA' | 'R';
  duration?: number; // In seconds (for movies)
  genres: string[];
  backdropUrl: string;
  posterUrl: string;
  logoUrl?: string;
  trailerUrl?: string;
  streamUrl: string;
  seasonsCount?: number;
  episodes?: Episode[];
  cast: CastMember[];
  introStartTime?: number;
  introEndTime?: number;
}

export interface WatchProgress {
  mediaId: string;
  episodeId?: string;
  lastPosition: number; // seconds
  duration: number;
  updatedAt: string;
}

export interface UserSubscription {
  status: 'active' | 'canceled' | 'past_due' | 'none';
  tier: AccessTier;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}