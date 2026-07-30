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
}: PageProps<"/[lang]/mp3">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return buildPageMetadata({
    locale: lang,
    pathSegment: "/mp3",
    variantKey: "mp3",
  });
}

/** MP3 / audio-extraction landing. Statically prerendered per locale. */
export default async function Mp3Page({ params }: PageProps<"/[lang]/mp3">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <LandingPage
      dict={dict}
      locale={lang}
      pathSegment="/mp3"
      contentKey="mp3"
      variantKey="mp3"
    />
  );
}
