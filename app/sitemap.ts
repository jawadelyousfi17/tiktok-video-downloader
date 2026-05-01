import type { MetadataRoute } from "next";

import { defaultLocale, getLocaleMeta, localeCodes, localePath } from "@/lib/i18n/config";

/**
 * Path segments for every page that should appear in the sitemap. The
 * home page is "/" — every variant landing repeats here so each gets its
 * own sitemap entry per locale.
 */
const PAGE_SEGMENTS = ["/", "/mp3", "/photos", "/carousel"] as const;

function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/**
 * Generate a sitemap with every page × locale URL plus the proper
 * hreflang alternate links so Google can map locale variants to each
 * other. We emit the sitemap from this file so it lives next to the
 * routes themselves and updates automatically when locales or page
 * segments are added.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  const entries: MetadataRoute.Sitemap = [];

  for (const segment of PAGE_SEGMENTS) {
    // Build the alternate-language map once per page; every locale entry
    // for this page shares the same alternates set.
    const alternates: Record<string, string> = {
      "x-default": origin + localePath(defaultLocale, segment),
    };
    for (const code of localeCodes) {
      alternates[getLocaleMeta(code).htmlLang] = origin + localePath(code, segment);
    }

    for (const code of localeCodes) {
      entries.push({
        url: origin + localePath(code, segment),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: segment === "/" ? 1 : 0.8,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
