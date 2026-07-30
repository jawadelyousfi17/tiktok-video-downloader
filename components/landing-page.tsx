import { DownloaderProvider } from "@/components/downloader/downloader-provider";
import { ResultPanel } from "@/components/downloader/result-panel";
import { PageJsonLd } from "@/components/seo/page-json-ld";
import { Hero } from "@/components/sections/hero";
import { IntroCopy } from "@/components/sections/intro-copy";
import { Features } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how-it-works";
import { SpecTable } from "@/components/sections/spec-table";
import { PlatformGuides } from "@/components/sections/platform-guides";
import { UseCases } from "@/components/sections/use-cases";
import { FaqSection } from "@/components/sections/faq";
import type { Dictionary } from "@/types/dictionary";
import type { Locale } from "@/types/locale";

/** Page keys shared by dict.content and dict.faq. */
export type LandingKey = keyof Dictionary["content"];

interface LandingPageProps {
  dict: Dictionary;
  locale: Locale;
  /** Path under the locale, e.g. "/" or "/mp3". */
  pathSegment: string;
  /** Selects the content and FAQ blocks for this page. */
  contentKey: LandingKey;
  /**
   * Variant copy key for the H1 and subtitle. Omitted on the home page,
   * which uses dict.hero instead.
   */
  variantKey?: keyof Dictionary["variants"];
}

/**
 * Shared composition for all four landing pages.
 *
 * The four routes differ only in which dictionary slices they read, so
 * the structure lives here — a layout change (say, moving the spec table
 * above the features grid) then happens once instead of four times and
 * can't drift between pages.
 *
 * Everything below <ResultPanel /> is a plain server component, so it
 * prerenders into the static HTML. Only the form and the result area
 * hydrate.
 */
export function LandingPage({
  dict,
  locale,
  pathSegment,
  contentKey,
  variantKey,
}: LandingPageProps) {
  const content = dict.content[contentKey];
  const variant = variantKey ? dict.variants[variantKey] : null;
  const heading = variant?.h1 ?? dict.hero.title;
  const description = variant?.subtitle ?? dict.hero.subtitle;

  return (
    <DownloaderProvider
      formDict={dict.hero.form}
      resultDict={dict.result}
      locale={locale}
    >
      <PageJsonLd
        dict={dict}
        locale={locale}
        pathSegment={pathSegment}
        name={heading}
        description={variant?.metaDescription ?? dict.meta.description}
      />

      <Hero dict={dict} heading={heading} description={description} />
      <ResultPanel />

      <IntroCopy data={content.intro} />
      <Features dict={dict} />
      <HowItWorks dict={dict} />
      <SpecTable data={content.specs} />
      <PlatformGuides data={content.guides} />
      <UseCases data={content.useCases} />
      <FaqSection data={dict.faq[contentKey]} />
    </DownloaderProvider>
  );
}
