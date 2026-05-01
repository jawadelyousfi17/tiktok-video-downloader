import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DownloadResult as ResultCard } from "@/components/download-result";
import { ScrollToResult } from "@/components/scroll-to-result";
import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how-it-works";
import { FaqSection } from "@/components/sections/faq";
import { isLocale, localeCodes, localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/i18n/metadata";
import { fetchForPage } from "@/services/render-fetch";

function firstString(value: string | string[] | undefined): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export function generateStaticParams() {
  return localeCodes.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/[lang]/mp3">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const meta = await buildPageMetadata({
    locale: lang,
    pathSegment: "/mp3",
    variantKey: "mp3",
  });
  const sp = await searchParams;
  if (firstString(sp.url)) meta.robots = { index: false, follow: true };
  return meta;
}

export default async function Mp3Page({
  params,
  searchParams,
}: PageProps<"/[lang]/mp3">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const sp = await searchParams;
  const dict = await getDictionary(lang);
  const rawUrl = firstString(sp.url);
  const fetched = await fetchForPage(rawUrl, dict);

  const resetHref = localePath(lang, "/mp3");

  return (
    <>
      <Hero
        dict={dict}
        locale={lang}
        heading={dict.variants.mp3.h1}
        description={dict.variants.mp3.subtitle}
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
      <FaqSection data={dict.faq.mp3} />
    </>
  );
}
