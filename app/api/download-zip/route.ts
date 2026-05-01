import archiver from "archiver";
import { Readable } from "node:stream";

import { isSameOriginRequest } from "@/services/origin";
import { checkRateLimit, clientKey, rateLimitHeaders } from "@/services/rate-limit";

/**
 * The route runs on the Node.js runtime because `archiver` uses Node
 * streams. Edge runtime is not supported.
 */
export const runtime = "nodejs";

/** Cap how many files we'll bundle in a single zip to keep memory bounded. */
const MAX_FILES = 60;

/**
 * Tightest limit of the three API routes — each request fans out into
 * dozens of upstream fetches and builds a multi-megabyte zip. 5/min
 * still covers a real user re-trying or downloading several carousels
 * in a session.
 */
const ZIP_LIMIT = 5;
const ZIP_WINDOW_MS = 60_000;

const ALLOWED_HOSTS = [
  /\.tiktokcdn\.com$/i,
  /\.tiktokcdn-us\.com$/i,
  /\.tokcdn\.com$/i,
  /\.tiktok\.com$/i,
];

function hostAllowed(hostname: string): boolean {
  return ALLOWED_HOSTS.some((pattern) => pattern.test(hostname));
}

function dispositionHeader(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "");
  const utf8 = encodeURIComponent(filename);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${utf8}`;
}

interface ZipRequest {
  filename?: string;
  urls?: unknown;
}

/**
 * Bundle a list of TikTok image URLs into a single ZIP and stream it back
 * with Content-Disposition: attachment. Doing it server-side gives us one
 * smooth download instead of N back-to-back browser downloads (which most
 * browsers throttle or prompt about). The host allowlist below is what
 * stops abuse — a caller cannot smuggle arbitrary hosts through us.
 */
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return new Response("Forbidden", { status: 403 });
  }

  const decision = checkRateLimit(
    `zip:${clientKey(request)}`,
    ZIP_LIMIT,
    ZIP_WINDOW_MS,
  );
  if (!decision.allowed) {
    return new Response("Too many requests", {
      status: 429,
      headers: rateLimitHeaders(decision),
    });
  }

  let body: ZipRequest;
  try {
    body = (await request.json()) as ZipRequest;
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  if (!Array.isArray(body.urls) || body.urls.length === 0) {
    return new Response("Missing urls", { status: 400 });
  }

  const photoUrls = (body.urls as unknown[])
    .filter((u): u is string => typeof u === "string" && u.length > 0)
    .slice(0, MAX_FILES);

  for (const candidate of photoUrls) {
    let parsed: URL;
    try {
      parsed = new URL(candidate);
    } catch {
      return new Response("Bad URL in list", { status: 400 });
    }
    if (!hostAllowed(parsed.hostname)) {
      return new Response("Host not allowed", { status: 400 });
    }
  }

  const archive = archiver("zip", { zlib: { level: 6 } });
  // We accept rather than abort on per-file failures: if one photo URL
  // expired we still want the user to get the rest.
  archive.on("warning", (err) => console.warn("zip warning", err));
  archive.on("error", (err) => console.error("zip error", err));

  // Append each photo as a streaming file. Sequential ordering is what
  // archiver expects when entries themselves are streams, so we kick off
  // the fetches in parallel but feed the bodies into the zip one at a
  // time as they arrive.
  (async () => {
    try {
      const fetched = await Promise.all(
        photoUrls.map(async (url, i) => {
          try {
            const r = await fetch(url, {
              headers: { Referer: "https://www.tiktok.com/" },
              cache: "no-store",
            });
            if (!r.ok || !r.body) return null;
            return { index: i, body: r.body };
          } catch {
            return null;
          }
        }),
      );
      for (const item of fetched) {
        if (!item) continue;
        const name = `photo-${String(item.index + 1).padStart(2, "0")}.jpg`;
        // Web ReadableStream<Uint8Array<ArrayBuffer>> vs Node's expected
        // ReadableStream<any> mismatch — runtime shape is identical, the
        // generic just changed in @types/node. Cast keeps the compiler happy.
        archive.append(
          Readable.fromWeb(item.body as unknown as Parameters<typeof Readable.fromWeb>[0]),
          { name },
        );
      }
    } finally {
      archive.finalize();
    }
  })();

  const zipFilename = (body.filename ?? "tiktok-photos") + ".zip";
  const stream = Readable.toWeb(archive) as unknown as ReadableStream<Uint8Array>;

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": dispositionHeader(zipFilename),
      "Cache-Control": "private, no-store",
      ...rateLimitHeaders(decision),
    },
  });
}
