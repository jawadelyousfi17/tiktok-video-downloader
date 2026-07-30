import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";

import "../globals.css";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getLocaleMeta, isLocale, localeCodes } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { siteOrigin } from "@/lib/site";

/**
 * Plus Jakarta Sans matches the friendly humanist feel of the design
 * reference at .design/landing.webp. Loaded with display:swap so first
 * paint never blocks on the font network round trip.
 */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

/**
 * Pre-render every supported locale at build time. Without this the [lang]
 * segment becomes dynamic and we lose the static-render guarantee from
 * CLAUDE.md.
 */
export function generateStaticParams() {
  return localeCodes.map((lang) => ({ lang }));
}

/**
 * Layout-level metadata only sets the brand title template here — each
 * page (home + every variant) builds its own per-page metadata via
 * lib/i18n/metadata#buildPageMetadata, so canonical/alternate URLs and
 * SEO copy stay correct per route.
 */
export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);
  return {
    /*
     * Without this, the canonical and hreflang links that
     * buildPageMetadata produces stay relative ("/fr/mp3"). Google ignores
     * relative hreflang outright, so every alternate would be silently
     * dropped. metadataBase is inherited by all pages under this layout,
     * which is what turns those paths into absolute URLs on the real
     * origin — and it resolves the OpenGraph/Twitter URLs too.
     */
    metadataBase: new URL(siteOrigin()),
    title: {
      default: dict.meta.title,
      template: `%s · ${dict.nav.brand}`,
    },
    /*
     * Icons are declared here rather than via app/icon.png. The app root
     * has no layout of its own — its only child is the [lang] dynamic
     * segment — so a file at app/icon.png gets resolved as lang="icon.png"
     * and answers with a 404 status (the body is right, the status is not,
     * which browsers treat as a missing icon). Serving them from public/
     * and naming them explicitly avoids that collision entirely.
     *
     * app/favicon.ico stays a file convention: Next gives it a dedicated
     * route, so it resolves correctly, still answers /favicon.ico for
     * crawlers that request it by that fixed path, and emits its own
     * <link> — which is why it is deliberately absent from the list below.
     */
    icons: {
      icon: [{ url: "/icon.png", sizes: "256x256", type: "image/png" }],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const meta = getLocaleMeta(lang);
  const dict = await getDictionary(lang);

  return (
    <html
      lang={meta.htmlLang}
      dir={meta.dir}
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-foreground focus:text-background focus:px-3 focus:py-2 focus:text-sm"
        >
          {dict.nav.skipToContent}
        </a>
        <SiteHeader locale={lang} dict={dict} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter dict={dict} locale={lang} />
      </body>
    </html>
  );
}
