import { absoluteUrl } from "@/lib/site";
import { getLocaleMeta, localePath } from "@/lib/i18n/config";
import type { Dictionary } from "@/types/dictionary";
import type { Locale } from "@/types/locale";

interface PageJsonLdProps {
  dict: Dictionary;
  locale: Locale;
  /** Path under the locale, e.g. "/" or "/mp3". */
  pathSegment: string;
  /** Visible H1 — reused as the application name for this page. */
  name: string;
  description: string;
}

/**
 * WebApplication + BreadcrumbList structured data.
 *
 * WebApplication is the honest type for a browser tool (SoftwareApplication
 * implies something you install) and is what earns the price/category
 * details in a rich result. The breadcrumb tells Google that /mp3 sits
 * under the locale home rather than floating on its own, which is how the
 * four landing pages get shown as a set instead of competing.
 *
 * Emitted as one @graph so both entities share a single script tag.
 */
export function PageJsonLd({
  dict,
  locale,
  pathSegment,
  name,
  description,
}: PageJsonLdProps) {
  const url = absoluteUrl(localePath(locale, pathSegment));
  const homeUrl = absoluteUrl(localePath(locale, "/"));
  const isHome = pathSegment === "/";

  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: dict.nav.brand, item: homeUrl },
  ];
  if (!isHome) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name,
      item: url,
    });
  }

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name,
        url,
        description,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Any",
        inLanguage: getLocaleMeta(locale).htmlLang,
        browserRequirements: "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbItems,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Composed entirely from typed dictionary strings and our own config.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
