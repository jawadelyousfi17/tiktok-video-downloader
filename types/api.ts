import type { DownloadResult } from "@/types/tiktok";

/**
 * Stable machine codes for every way /api/fetch can fail. The route never
 * sends prose: the client owns the dictionary and maps the code to the
 * visitor's language. That's what lets the landing pages stay static —
 * the server has no idea which locale asked, and doesn't need to.
 */
export type FetchErrorCode =
  | "invalid-url"
  | "not-found"
  | "rate-limited"
  | "server";

export type FetchApiResponse =
  | { ok: true; result: DownloadResult }
  | { ok: false; code: FetchErrorCode };

/** Request body accepted by POST /api/fetch. */
export interface FetchApiRequest {
  url: string;
}
