/**
 * Minimal TikTok URL validator. Accepts the public-facing host (tiktok.com),
 * the short share host (vm.tiktok.com / vt.tiktok.com), and language
 * subdomains (m.tiktok.com, www.tiktok.com). The goal is to reject obvious
 * non-TikTok input on the client; the server side will still verify before
 * fetching anything.
 */
const TIKTOK_HOSTS = [
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com",
];

/**
 * Take a raw user-pasted string and return a fully-formed https TikTok
 * URL, or null if the input doesn't look like a TikTok link.
 *
 * Why we don't just rely on `new URL()`: TikTok shares come from the app
 * already protocoled (https://), but copy-pasting from a tap-and-hold
 * menu, the address bar of a desktop browser, or a chat client often
 * drops the scheme — `tiktok.com/@user/video/123` is a real shape we
 * have to accept. Prepending `https://` before parsing fixes that.
 */
export function normalizeTikTokUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!TIKTOK_HOSTS.includes(url.hostname.toLowerCase())) return null;
  // Always send https upstream — TikTok serves it, and the rate-limiter
  // / cache key normalization downstream assumes a consistent scheme.
  url.protocol = "https:";
  return url.toString();
}

export function isTikTokUrl(value: string): boolean {
  return normalizeTikTokUrl(value) !== null;
}
