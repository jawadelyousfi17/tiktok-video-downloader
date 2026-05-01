import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DownloadResult as ResultCard } from "@/components/download-result";
import { ScrollToResult } from "@/components/scroll-to-result";
import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how-it-works";
import { FaqSection } from "@/components/sections/faq";
import { isLocale, localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/i18n/metadata";
import { fetchForPage } from "@/services/render-fetch";

/**
 * Pull a single string out of a searchParams entry. Next 16 hands these
 * to us as `string | string[] | undefined`; we just want the first scalar.
 */
function firstString(value: string | string[] | undefined): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const meta = await buildPageMetadata({ locale: lang, pathSegment: "/" });
  const sp = await searchParams;
  // Result URLs (?url=…) are per-video and shouldn't accumulate in
  // Google's index — only the canonical landing pages do.
  if (firstString(sp.url)) meta.robots = { index: false, follow: true };
  return meta;
}

/**
 * Home / video-downloader landing. When `?url=` is present the page
 * server-renders the download result inline; otherwise it serves the
 * static landing layout for SEO.
 */
export default async function HomePage({
  params,
  searchParams,
}: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const sp = await searchParams;
  const dict = await getDictionary(lang);
  const rawUrl = firstString(sp.url);
  const fetched = await fetchForPage(rawUrl, dict);

  const resetHref = localePath(lang, "/");

  return (
    <>
      <Hero
        dict={dict}
        locale={lang}
        initialUrl={fetched.normalizedUrl ?? rawUrl}
        errorMessage={fetched.errorMessage}
      />

      {fetched.result ? (
        <section
          id="result"
          className="mx-auto -mt-2 max-w-3xl scroll-mt-16 px-4 pb-12 sm:px-6"
        >
          <ResultCard
            result={fetched.result}
            dict={dict.result}
            locale={lang}
            resetHref={resetHref}
          />
          <ScrollToResult />
        </section>
      ) : null}

      <Features dict={dict} />
      <HowItWorks dict={dict} />
      <FaqSection data={dict.faq.home} />
    </>
  );
}
