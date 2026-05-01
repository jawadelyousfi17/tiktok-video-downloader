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

export function isTikTokUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    return TIKTOK_HOSTS.includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}
