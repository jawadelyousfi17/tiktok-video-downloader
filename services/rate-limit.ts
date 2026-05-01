import "server-only";

import { LruTtlCache, getOrCreateCache } from "@/services/cache";

interface Bucket {
  count: number;
  /** Unix ms when this bucket expires and the count resets. */
  resetAt: number;
}

/**
 * Shared bucket store. Reused across routes via getOrCreateCache so HMR
 * in dev and warm serverless containers in prod see the same instance.
 *
 * Cache TTL is generous (10 minutes); the rate-limit logic itself is the
 * source of truth for whether a bucket is still active — the cache TTL
 * just acts as a periodic cleanup so unused IP keys don't accumulate
 * forever in long-running instances.
 */
const buckets = getOrCreateCache<Bucket>(
  "__rateLimitBuckets",
  () => new LruTtlCache<Bucket>(10_000, 10 * 60 * 1000),
);

export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Unix ms when the current window ends. */
  resetAt: number;
  /** Seconds the client should wait before retrying (only set when blocked). */
  retryAfterSeconds?: number;
}

/**
 * Fixed-window rate limiter. Each (key, window) gets `limit` requests
 * before the bucket flips to denied until `resetAt`. Fixed window has a
 * mild thundering-herd risk at boundaries, but is dramatically simpler
 * than sliding-window and the boundary effects are invisible to humans
 * — only matters if a bot perfectly aligns to the window edge.
 *
 * In-process state means cross-instance correctness needs Redis. We
 * accept the trade-off: a single warm container catches sustained abuse
 * (which is the point), and cold-start dilution is negligible.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitDecision {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const fresh: Bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(key, fresh);
    return { allowed: true, limit, remaining: limit - 1, resetAt: fresh.resetAt };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  const next: Bucket = { count: existing.count + 1, resetAt: existing.resetAt };
  buckets.set(key, next);
  return {
    allowed: true,
    limit,
    remaining: limit - next.count,
    resetAt: next.resetAt,
  };
}

/**
 * Best-effort client identification for bucketing. Vercel sets a
 * platform-specific header that survives its edge network unmodified;
 * x-forwarded-for is the open-web fallback. Several users behind a
 * shared NAT will collide into one bucket, which is an accepted trade
 * for the open web — the alternative (cookie or fingerprint) gets
 * defeated by clearing storage and adds privacy concerns.
 */
export function clientKey(request: Request): string {
  const candidate =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "anonymous";
  const first = candidate.split(",")[0]?.trim() || "anonymous";
  return first;
}

/**
 * Standard rate-limit response headers. RFC-compliant names so any
 * polite client (curl, browser dev console, monitoring tool) can read
 * the remaining budget without parsing our JSON envelope.
 */
export function rateLimitHeaders(decision: RateLimitDecision): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(decision.limit),
    "X-RateLimit-Remaining": String(decision.remaining),
    "X-RateLimit-Reset": String(Math.floor(decision.resetAt / 1000)),
  };
  if (decision.retryAfterSeconds !== undefined) {
    headers["Retry-After"] = String(decision.retryAfterSeconds);
  }
  return headers;
}
