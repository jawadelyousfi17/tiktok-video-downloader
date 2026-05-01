/**
 * Raw response from tiktok-scraper7 on RapidAPI. We only type the fields we
 * actually consume — the upstream payload also returns ad metadata, comment
 * settings, etc. that we ignore.
 */
export interface RapidApiResponse {
  code: number;
  msg: string;
  data?: RapidApiData;
}

export interface RapidApiData {
  id: string;
  region?: string;
  title?: string;
  cover?: string;
  origin_cover?: string;
  ai_dynamic_cover?: string;
  duration?: number;
  /** No-watermark MP4 URL. */
  play?: string;
  /** Watermarked MP4 URL — kept for completeness, not surfaced to the UI. */
  wmplay?: string;
  /** HD MP4 URL when the upstream call was made with hd=1. */
  hdplay?: string;
  /** Direct music/audio URL. */
  music?: string;
  music_info?: {
    title?: string;
    author?: string;
    cover?: string;
    duration?: number;
    /** Same audio URL as `music`, mirrored on the music_info object. */
    play?: string;
  };
  /** Photo carousel URLs when the post is a slideshow rather than a video. */
  images?: string[];
  size?: number;
  hd_size?: number;
  play_count?: number;
  digg_count?: number;
  comment_count?: number;
  share_count?: number;
  author?: {
    id?: string;
    unique_id?: string;
    nickname?: string;
    avatar?: string;
  };
}

export type DownloadKind = "video-hd" | "video-sd" | "audio";

export interface DownloadOption {
  kind: DownloadKind;
  /** Direct upstream URL — passed to /api/download for streaming. */
  url: string;
  /** Approximate file size in bytes if the upstream knew it, else null. */
  sizeBytes: number | null;
  /** Suggested filename (no path), used in Content-Disposition. */
  filename: string;
}

export interface DownloadAuthor {
  uniqueId: string;
  nickname: string;
  avatar: string | null;
}

export interface DownloadStats {
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
}

/**
 * What the client actually receives. Only the URLs, names, and metadata it
 * needs to render the result card — no upstream secrets, no fields we do
 * not display.
 */
export interface DownloadResult {
  id: string;
  title: string;
  cover: string;
  durationSeconds: number | null;
  author: DownloadAuthor;
  stats: DownloadStats;
  /** Empty when the post is a single video; populated when it is a slideshow. */
  photos: string[];
  /** Empty for slideshow posts that have no playable video. */
  videos: DownloadOption[];
  audio: DownloadOption | null;
}
