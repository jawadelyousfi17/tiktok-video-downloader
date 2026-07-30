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
}: PageProps<"/[lang]/photos">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return buildPageMetadata({
    locale: lang,
    pathSegment: "/photos",
    variantKey: "photos",
  });
}

/** Photo / slideshow landing. Statically prerendered per locale. */
export default async function PhotosPage({ params }: PageProps<"/[lang]/photos">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <LandingPage
      dict={dict}
      locale={lang}
      pathSegment="/photos"
      contentKey="photos"
      variantKey="photos"
    />
  );
}
