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
}: PageProps<"/[lang]/photos">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return buildPageMetadata({ locale: lang, pathSegment: "/photos", variantKey: "photos" });
}

/**
 * Targets "tiktok photo downloader" / "save tiktok photos" intent. Same
 * form as the home page — when a slideshow URL is submitted, the result
 * card already renders the photo grid with per-photo + Download all.
 */
export default async function PhotosPage({ params }: PageProps<"/[lang]/photos">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Hero
        dict={dict}
        locale={lang}
        heading={dict.variants.photos.h1}
        description={dict.variants.photos.subtitle}
      />
      <Features dict={dict} />
      <HowItWorks dict={dict} />
      <FaqSection data={dict.faq.photos} />
    </>
  );
}
