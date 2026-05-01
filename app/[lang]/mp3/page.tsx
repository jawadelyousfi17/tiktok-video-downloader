import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how-it-works";
import { FaqSection } from "@/components/sections/faq";
import { isLocale, localeCodes } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/i18n/metadata";

export function generateStaticParams() {
  return localeCodes.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/mp3">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return buildPageMetadata({ locale: lang, pathSegment: "/mp3", variantKey: "mp3" });
}

/**
 * SEO-targeted landing for "TikTok MP3 downloader" search intent. The
 * underlying form is the same one shown on the home page — TikTok URLs
 * resolve to a result card that already includes an MP3 download button
 * — but this page front-loads the MP3 keyword in the H1, meta, and
 * hreflang alternates so Google can match it to the right query.
 */
export default async function Mp3Page({ params }: PageProps<"/[lang]/mp3">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Hero
        dict={dict}
        locale={lang}
        heading={dict.variants.mp3.h1}
        description={dict.variants.mp3.subtitle}
      />
      <Features dict={dict} />
      <HowItWorks dict={dict} />
      <FaqSection data={dict.faq.mp3} />
    </>
  );
}
