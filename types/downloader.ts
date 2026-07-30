import type { DownloadResult } from "@/types/tiktok";

/**
 * Lifecycle of a single lookup. Kept as a union rather than a pair of
 * booleans so "loading and also showing a stale result" is unrepresentable.
 */
export type DownloaderStatus = "idle" | "loading" | "success" | "error";

export interface DownloaderState {
  /** Current text in the URL input. */
  value: string;
  status: DownloaderStatus;
  result: DownloadResult | null;
  /** Already localized — the provider maps API codes to dictionary copy. */
  errorMessage: string | null;
}
