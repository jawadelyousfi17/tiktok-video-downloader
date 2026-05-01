import "server-only";

import { headers } from "next/headers";

import { normalizeTikTokUrl } from "@/lib/tiktok";
import { checkRateLimit } from "@/services/rate-limit";
import { TikTokFetchError, fetchTikTok } from "@/services/tiktok";
import type { Dictionary } from "@/types/dictionary";
import type { DownloadResult } from "@/types/tiktok";

/**
 * Per-IP cap for the server-rendered fetch path. Same numbers we used
 * to enforce on /api/fetch — protects the metered RapidAPI quota from
 * sustained automated traffic.
 */
const FETCH_LIMIT = 15;
const FETCH_WINDOW_MS = 60_000;

/**
 * Synchronous URL validation. Pages call this during their render to
 * decide whether to suspend on the fetch (valid URL) or surface an
 * "invalid URL" error in the form (no upstream call needed).
 *
 * Returning the normalized URL (rather than just a boolean) means the
 * caller can pass the cleaned-up form back into the input as the
 * pre-filled value, so users see what we actually used.
 */
export function normalizeForRender(
  rawUrl: string | null | undefined,
  dict: Dictionary,
): { normalized: string | null; formError: string | null } {
  if (!rawUrl) return { normalized: null, formError: null };
  const normalized = normalizeTikTokUrl(rawUrl);
  if (!normalized) {
    return { normalized: null, formError: dict.hero.form.errorInvalid };
  }
  return { normalized, formError: null };
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

export interface AsyncFetchOutcome {
  result: DownloadResult | null;
  errorMessage: string | null;
}

/**
 * Run the upstream fetch. Called from inside a Suspense boundary so the
 * page shell (form, hero, features, FAQ) flushes immediately and the
 * loader streams in the result chunk only when ready.
 *
 * The URL must already be normalized — sync validation in
 * `normalizeForRender` handles that. Always returns an outcome; never
 * throws.
 */
export async function fetchAfterNormalize(
  normalizedUrl: string,
  dict: Dictionary,
): Promise<AsyncFetchOutcome> {
  const decision = checkRateLimit(`fetch:${await clientIp()}`, FETCH_LIMIT, FETCH_WINDOW_MS);
  if (!decision.allowed) {
    return { result: null, errorMessage: dict.hero.form.errorRateLimit };
  }

  try {
    const result = await fetchTikTok(normalizedUrl);
    return { result, errorMessage: null };
  } catch (err) {
    if (err instanceof TikTokFetchError) {
      switch (err.code) {
        case "not-found":
          return { result: null, errorMessage: dict.hero.form.errorFetch };
        case "rate-limited":
          return { result: null, errorMessage: dict.hero.form.errorRateLimit };
        default:
          return { result: null, errorMessage: dict.hero.form.errorServer };
      }
    }
    return { result: null, errorMessage: dict.hero.form.errorServer };
  }
}
