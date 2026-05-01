import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how-it-works";
import { FaqSection } from "@/components/sections/faq";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return buildPageMetadata({ locale: lang, pathSegment: "/" });
}

/**
 * Home / video-downloader landing. The variant pages (/mp3, /photos,
 * /carousel) reuse the same Hero+Features+HowItWorks composition with
 * keyword-targeted copy — only the home page omits the variantKey.
 */
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <>
      <Hero dict={dict} locale={lang} />
      <Features dict={dict} />
      <HowItWorks dict={dict} />
      <FaqSection data={dict.faq.home} />
    </>
  );
}
