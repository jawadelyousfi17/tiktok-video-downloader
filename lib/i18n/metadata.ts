import type { Metadata } from "next";

import { getLocaleMeta, localeCodes, localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Dictionary, VariantCopy } from "@/types/dictionary";
import type { Locale } from "@/types/locale";

export type VariantKey = keyof Dictionary["variants"];

interface BuildMetadataArgs {
  /** Path under each locale, e.g. "/", "/mp3", "/photos". */
  pathSegment: string;
  /** Variant key for SEO copy. Omit for the home page (uses dict.meta). */
  variantKey?: VariantKey;
  locale: Locale;
}

/**
 * Build the per-page Metadata object including hreflang alternates that
 * point at the equivalent path in every other locale. Used by both the
 * home page (no variant) and the SEO-targeted variant pages.
 *
 * Why a shared helper: alternate URLs are easy to get subtly wrong
 * (forgetting a locale, mismatching the canonical with the alternates,
 * dropping the x-default). One function = one source of truth.
 */
export async function buildPageMetadata({
  pathSegment,
  variantKey,
  locale,
}: BuildMetadataArgs): Promise<Metadata> {
  const dict = await getDictionary(locale);
  const variant: VariantCopy | null = variantKey ? dict.variants[variantKey] : null;

  const title = variant?.metaTitle ?? dict.meta.title;
  const description = variant?.metaDescription ?? dict.meta.description;
  const ogTitle = variant?.ogTitle ?? dict.meta.ogTitle;
  const ogDescription = variant?.ogDescription ?? dict.meta.ogDescription;

  const languages: Record<string, string> = {
    "x-default": localePath("en", pathSegment),
  };
  for (const code of localeCodes) {
    languages[getLocaleMeta(code).htmlLang] = localePath(code, pathSegment);
  }

  return {
    title,
    description,
    alternates: {
      canonical: localePath(locale, pathSegment),
      languages,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: "website",
      locale: getLocaleMeta(locale).htmlLang,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
    },
    robots: { index: true, follow: true },
  };
}
