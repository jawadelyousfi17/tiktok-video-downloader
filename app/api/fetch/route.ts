import { NextResponse } from "next/server";

import { normalizeTikTokUrl } from "@/lib/tiktok";
import { isSameOriginRequest } from "@/services/origin";
import { checkRateLimit, clientKey, rateLimitHeaders } from "@/services/rate-limit";
import { TikTokFetchError, fetchTikTok } from "@/services/tiktok";
import type { FetchApiResponse, FetchErrorCode } from "@/types/api";

/**
 * Per-IP cap on the metered RapidAPI path. Same numbers the old
 * server-rendered flow enforced — 15 lookups a minute is far more than a
 * human needs and still keeps the billed quota out of reach of a script.
 */
const FETCH_LIMIT = 15;
const FETCH_WINDOW_MS = 60_000;

function fail(code: FetchErrorCode, status: number, headers?: HeadersInit) {
  return NextResponse.json<FetchApiResponse>({ ok: false, code }, { status, headers });
}

/**
 * Map an upstream failure to the client-facing code. Anything we can't
 * classify becomes "server" so the visitor gets the generic try-again
 * copy rather than a misleading "video not found".
 */
function toErrorCode(err: unknown): FetchErrorCode {
  if (!(err instanceof TikTokFetchError)) return "server";
  switch (err.code) {
    case "not-found":
      return "not-found";
    case "rate-limited":
      return "rate-limited";
    case "invalid-input":
      return "invalid-url";
    default:
      return "server";
  }
}

/**
 * Look up a TikTok post and return the normalized download options.
 *
 * This exists so the landing pages can be fully prerendered: they no
 * longer read `?url=` during render, so nothing about them depends on the
 * request. The browser calls this route after the static HTML has already
 * been served from the CDN.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!isSameOriginRequest(request)) {
    return fail("server", 403);
  }

  const decision = checkRateLimit(
    `fetch:${clientKey(request)}`,
    FETCH_LIMIT,
    FETCH_WINDOW_MS,
  );
  if (!decision.allowed) {
    return fail("rate-limited", 429, rateLimitHeaders(decision));
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("invalid-url", 400);
  }

  const raw =
    typeof body === "object" && body !== null && "url" in body
      ? (body as { url: unknown }).url
      : null;

  if (typeof raw !== "string") {
    return fail("invalid-url", 400);
  }

  // Re-validate server side even though the form already checked. The
  // client check is a UX affordance; this one is the actual gate that
  // keeps non-TikTok URLs from reaching the billed upstream.
  const normalized = normalizeTikTokUrl(raw);
  if (!normalized) {
    return fail("invalid-url", 400);
  }

  try {
    const result = await fetchTikTok(normalized);
    return NextResponse.json<FetchApiResponse>(
      { ok: true, result },
      { headers: rateLimitHeaders(decision) },
    );
  } catch (err) {
    const code = toErrorCode(err);
    return fail(code, code === "not-found" ? 404 : 502, rateLimitHeaders(decision));
  }
}
