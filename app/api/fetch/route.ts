import { NextResponse } from "next/server";

import { isTikTokUrl } from "@/lib/tiktok";
import {
  checkRateLimit,
  clientKey,
  rateLimitHeaders,
} from "@/services/rate-limit";
import { TikTokFetchError, fetchTikTok } from "@/services/tiktok";

/**
 * Stable error codes the client maps to localized strings. The route never
 * returns the upstream error message verbatim — it might leak RapidAPI
 * internals or be unfriendly machine text.
 */
type ErrorCode = "invalid-url" | "not-found" | "rate-limited" | "server" | "missing-config";

/**
 * Per-IP cap on /api/fetch. RapidAPI is billed per request, so this is
 * the most important quota to defend. 15/min is generous for a real user
 * (paste a couple links in a session) and tight enough that sustained
 * automated traffic falls off a cliff after a few seconds.
 */
const FETCH_LIMIT = 15;
const FETCH_WINDOW_MS = 60_000;

function reply(code: ErrorCode, status: number, headers: Record<string, string> = {}) {
  return NextResponse.json({ ok: false, code }, { status, headers });
}

export async function POST(request: Request) {
  const decision = checkRateLimit(
    `fetch:${clientKey(request)}`,
    FETCH_LIMIT,
    FETCH_WINDOW_MS,
  );
  const limitHeaders = rateLimitHeaders(decision);

  if (!decision.allowed) {
    return reply("rate-limited", 429, limitHeaders);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reply("invalid-url", 400, limitHeaders);
  }

  const url =
    typeof body === "object" && body && "url" in body
      ? String((body as { url: unknown }).url ?? "")
      : "";

  if (!isTikTokUrl(url)) return reply("invalid-url", 400, limitHeaders);

  try {
    const result = await fetchTikTok(url);
    return NextResponse.json({ ok: true, result }, { headers: limitHeaders });
  } catch (err) {
    if (err instanceof TikTokFetchError) {
      switch (err.code) {
        case "invalid-input":
          return reply("invalid-url", 400, limitHeaders);
        case "not-found":
          return reply("not-found", 404, limitHeaders);
        case "rate-limited":
          return reply("rate-limited", 429, limitHeaders);
        case "missing-config":
          return reply("missing-config", 500, limitHeaders);
        default:
          return reply("server", 502, limitHeaders);
      }
    }
    return reply("server", 500, limitHeaders);
  }
}
