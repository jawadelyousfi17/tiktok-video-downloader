import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LandingPage } from "@/components/landing-page";
import { isLocale, localeCodes } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/i18n/metadata";

export function generateStaticParams() {
  return localeCodes.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return buildPageMetadata({ locale: lang, pathSegment: "/" });
}

/**
 * Home / video-downloader landing.
 *
 * Fully prerendered: nothing here reads the request, so Next emits static
 * HTML per locale at build time and a crawler gets the whole document —
 * headings, prose, spec table, guides, FAQ — straight from the CDN. The
 * lookup itself is a client island that posts to /api/fetch after
 * hydration, which is what keeps the page free of request-time input.
 */
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <LandingPage dict={dict} locale={lang} pathSegment="/" contentKey="home" />
  );
}
