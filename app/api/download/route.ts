import { NextResponse } from "next/server";

import { checkRateLimit, clientKey, rateLimitHeaders } from "@/services/rate-limit";

/**
 * Hostnames we'll happily proxy through. Locking this to TikTok CDN
 * domains stops the endpoint from being abused as a generic open proxy.
 */
const ALLOWED_HOSTS = [
  /\.tiktokcdn\.com$/i,
  /\.tiktokcdn-us\.com$/i,
  /\.tokcdn\.com$/i,
  /\.tiktok\.com$/i,
];

/**
 * Per-IP cap on the streaming download proxy. Each completed fetch
 * typically results in 1–3 download clicks (HD, audio, maybe SD); 60/min
 * gives generous headroom for that, while still capping a malicious
 * client at one request per second of bandwidth-heavy pass-through.
 */
const DOWNLOAD_LIMIT = 60;
const DOWNLOAD_WINDOW_MS = 60_000;

function hostAllowed(hostname: string): boolean {
  return ALLOWED_HOSTS.some((pattern) => pattern.test(hostname));
}

/**
 * Force a safe filename onto the Content-Disposition header. The browser
 * will use this name even though the upstream resource has its own URL.
 * RFC 5987 encoding handles non-ASCII titles (e.g. Japanese, Arabic).
 */
function dispositionHeader(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "");
  const utf8 = encodeURIComponent(filename);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${utf8}`;
}

/**
 * Streaming download proxy. The browser's `download` attribute is ignored
 * for cross-origin URLs, so without this users would just see the video
 * play in a new tab instead of saving. We fetch the upstream file and
 * stream the body straight back with Content-Disposition: attachment.
 */
export async function GET(request: Request) {
  const decision = checkRateLimit(
    `download:${clientKey(request)}`,
    DOWNLOAD_LIMIT,
    DOWNLOAD_WINDOW_MS,
  );
  if (!decision.allowed) {
    return new NextResponse("Too many requests", {
      status: 429,
      headers: rateLimitHeaders(decision),
    });
  }

  const { searchParams } = new URL(request.url);
  const target = searchParams.get("u");
  const filename = (searchParams.get("filename") || "tiktok").trim();

  if (!target) {
    return new NextResponse("Missing u", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new NextResponse("Bad URL", { status: 400 });
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return new NextResponse("Bad protocol", { status: 400 });
  }
  if (!hostAllowed(parsed.hostname)) {
    return new NextResponse("Host not allowed", { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(parsed, {
      // Some TikTok CDN URLs require a Referer to serve the file. Setting
      // it to tiktok.com matches what the share share-link flow would do.
      headers: { Referer: "https://www.tiktok.com/" },
      cache: "no-store",
    });
  } catch {
    return new NextResponse("Upstream fetch failed", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Upstream error", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const contentLength = upstream.headers.get("content-length");

  const headers = new Headers({
    "Content-Type": contentType,
    "Content-Disposition": dispositionHeader(filename),
    "Cache-Control": "private, no-store",
    ...rateLimitHeaders(decision),
  });
  if (contentLength) headers.set("Content-Length", contentLength);

  return new NextResponse(upstream.body, { status: 200, headers });
}
