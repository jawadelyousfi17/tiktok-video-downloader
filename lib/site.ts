/**
 * Absolute origin for the deployed site, with any trailing slash removed.
 *
 * Structured data and the sitemap both need absolute URLs — relative ones
 * are silently ignored by crawlers — so this has to be a real origin even
 * in local development, hence the localhost fallback.
 */
export function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/** Join the site origin with a root-relative path. */
export function absoluteUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${siteOrigin()}${clean}`;
}
