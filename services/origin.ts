import "server-only";

/**
 * Best-effort same-origin check. Accepts a request only when the
 * Origin or Referer header matches the host the request was sent to.
 *
 * - POST/PUT/DELETE from a browser fetch always carry the Origin header,
 *   so the primary path is `Origin === request URL origin`.
 * - GET navigations (e.g. our /api/download anchor click) don't set
 *   Origin, but they do set Referer, which we fall back to.
 *
 * Important caveat: any non-browser caller (curl, scripts, headless
 * tooling) can trivially spoof both headers with `-H "Origin: ..."` or
 * `-H "Referer: ..."`. This check stops casual scraping, accidental
 * hotlinking, and lazy bots — it does NOT defeat a determined attacker.
 * The real defenses against that are the RapidAPI quota cap (set in the
 * RapidAPI dashboard, hard limits the bill) and a bot challenge like
 * Cloudflare Turnstile if real abuse shows up.
 */
export function isSameOriginRequest(request: Request): boolean {
  let expectedOrigin: string;
  try {
    expectedOrigin = new URL(request.url).origin;
  } catch {
    return false;
  }

  const origin = request.headers.get("origin");
  if (origin) return origin === expectedOrigin;

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === expectedOrigin;
    } catch {
      return false;
    }
  }

  // No Origin and no Referer = direct curl/script call. Reject.
  return false;
}
