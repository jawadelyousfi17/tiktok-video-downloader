import "server-only";

import { headers } from "next/headers";

import { normalizeTikTokUrl } from "@/lib/tiktok";
import { checkRateLimit } from "@/services/rate-limit";
import { TikTokFetchError, fetchTikTok } from "@/services/tiktok";
import type { Dictionary } from "@/types/dictionary";
import type { DownloadResult } from "@/types/tiktok";

/**
 * Per-IP cap for the server-rendered fetch path. Same numbers we used to
 * enforce on /api/fetch — the limit follows the same rationale: protect
 * the metered RapidAPI quota from sustained automated traffic.
 */
const FETCH_LIMIT = 15;
const FETCH_WINDOW_MS = 60_000;

export interface PageFetchOutcome {
  /** The fetched download data, or null when there was no URL or an error. */
  result: DownloadResult | null;
  /** Localized error message to show inside the form, or null on success. */
  errorMessage: string | null;
  /** Normalized https URL when the input parsed; pre-fills the form input. */
  normalizedUrl: string | null;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  const candidate =
    h.get("x-vercel-forwarded-for") ??
    h.get("x-forwarded-for") ??
    h.get("x-real-ip") ??
    "anonymous";
  return candidate.split(",")[0]?.trim() || "anonymous";
}

/**
 * Run the upstream fetch from inside a server-rendered page. Mirrors the
 * old /api/fetch route — same rate-limit + cache + error mapping — but
 * the data lands inside the HTML rather than as a JSON response, so
 * there's no public JSON endpoint for casual scrapers to call.
 *
 * Always returns; never throws. Errors are mapped to localized strings
 * the parent page passes into the form's error display.
 */
export async function fetchForPage(
  rawUrl: string | null | undefined,
  dict: Dictionary,
): Promise<PageFetchOutcome> {
  if (!rawUrl) return { result: null, errorMessage: null, normalizedUrl: null };

  const normalized = normalizeTikTokUrl(rawUrl);
  if (!normalized) {
    return {
      result: null,
      errorMessage: dict.hero.form.errorInvalid,
      normalizedUrl: null,
    };
  }

  const decision = checkRateLimit(`fetch:${await clientIp()}`, FETCH_LIMIT, FETCH_WINDOW_MS);
  if (!decision.allowed) {
    return {
      result: null,
      errorMessage: dict.hero.form.errorRateLimit,
      normalizedUrl: normalized,
    };
  }

  try {
    const result = await fetchTikTok(normalized);
    return { result, errorMessage: null, normalizedUrl: normalized };
  } catch (err) {
    if (err instanceof TikTokFetchError) {
      switch (err.code) {
        case "not-found":
          return {
            result: null,
            errorMessage: dict.hero.form.errorFetch,
            normalizedUrl: normalized,
          };
        case "rate-limited":
          return {
            result: null,
            errorMessage: dict.hero.form.errorRateLimit,
            normalizedUrl: normalized,
          };
        default:
          return {
            result: null,
            errorMessage: dict.hero.form.errorServer,
            normalizedUrl: normalized,
          };
      }
    }
    return {
      result: null,
      errorMessage: dict.hero.form.errorServer,
      normalizedUrl: normalized,
    };
  }
}
