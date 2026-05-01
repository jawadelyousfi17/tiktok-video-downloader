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
}: PageProps<"/[lang]/carousel">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return buildPageMetadata({
    locale: lang,
    pathSegment: "/carousel",
    variantKey: "carousel",
  });
}

/**
 * Targets "tiktok carousel downloader" / "tiktok slideshow downloader".
 * Carousel and photos are the same upstream feature on TikTok (image
 * posts) so this page exists primarily for keyword distinction; the
 * underlying form and result card behavior are identical.
 */
export default async function CarouselPage({ params }: PageProps<"/[lang]/carousel">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Hero
        dict={dict}
        locale={lang}
        heading={dict.variants.carousel.h1}
        description={dict.variants.carousel.subtitle}
      />
      <Features dict={dict} />
      <HowItWorks dict={dict} />
      <FaqSection data={dict.faq.carousel} />
    </>
  );
}
