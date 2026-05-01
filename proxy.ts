import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { defaultLocale, localeCodes } from "@/lib/i18n/config";

/**
 * Locales that own a URL prefix. The default locale is intentionally absent —
 * English lives at "/" and we rewrite (not redirect) so the URL stays clean
 * while the [lang] route segment still receives lang=en.
 */
const PREFIXED_LOCALES = localeCodes.filter((l) => l !== defaultLocale);

/**
 * If a user lands on /en/* we send them to the canonical / root, otherwise
 * we'd have two URLs serving the same English page and split SEO signals.
 */
function isDefaultLocaleAttempt(pathname: string): boolean {
  return pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`);
}

function hasPrefixedLocale(pathname: string): boolean {
  return PREFIXED_LOCALES.some(
    (code) => pathname === `/${code}` || pathname.startsWith(`/${code}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isDefaultLocaleAttempt(pathname)) {
    const stripped = pathname.replace(new RegExp(`^/${defaultLocale}`), "") || "/";
    return NextResponse.redirect(new URL(`${stripped}${search}`, request.url));
  }

  if (hasPrefixedLocale(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|woff2?)).*)",
  ],
};
