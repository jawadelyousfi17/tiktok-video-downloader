import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AsyncResult } from "@/components/async-result";
import { ResultLoader } from "@/components/result-loader";
import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how-it-works";
import { FaqSection } from "@/components/sections/faq";
import { isLocale, localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/i18n/metadata";
import { normalizeForRender } from "@/services/render-fetch";

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
  // Google's index — only the canonical landings do.
  if (firstString(sp.url)) meta.robots = { index: false, follow: true };
  return meta;
}

/**
 * Home / video-downloader landing. URL validation runs synchronously so
 * "invalid TikTok URL" errors flush in the form immediately. The actual
 * upstream fetch lives inside a Suspense boundary — the page shell
 * streams first, then the result chunk replaces the loader once the
 * RapidAPI call resolves.
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
  const { normalized, formError } = normalizeForRender(rawUrl, dict);

  const resetHref = localePath(lang, "/");

  return (
    <>
      <Hero
        dict={dict}
        locale={lang}
        initialUrl={normalized ?? rawUrl}
        errorMessage={formError}
      />

      {normalized ? (
        <Suspense fallback={<ResultLoader />}>
          <AsyncResult
            url={normalized}
            dict={dict}
            locale={lang}
            resetHref={resetHref}
          />
        </Suspense>
      ) : null}

      <Features dict={dict} />
      <HowItWorks dict={dict} />
      <FaqSection data={dict.faq.home} />
    </>
  );
}
