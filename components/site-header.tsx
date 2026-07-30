import Image from "next/image";
import Link from "next/link";

import { defaultLocale, localePath } from "@/lib/i18n/config";
import type { Dictionary } from "@/types/dictionary";
import type { Locale } from "@/types/locale";

import { LanguageSwitcher } from "./language-switcher";

interface SiteHeaderProps {
  locale: Locale;
  dict: Dictionary;
}

/**
 * Top navigation. Stays sticky so the brand and language switcher are
 * always reachable while the user scrolls through the long landing page.
 *
 * The logo is a square icon with no lettering, so the wordmark is real
 * text beside it rather than part of the image. That also means the brand
 * name is selectable, readable by screen readers, and indexable.
 */
export function SiteHeader({ locale, dict }: SiteHeaderProps) {
  const home = localePath(locale, "/");
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={home}
          hrefLang={locale === defaultLocale ? "en" : locale}
          className="inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          {/*
           * alt is empty on purpose: the wordmark next to it already names
           * the site, and a filled alt would make screen readers announce
           * the brand twice in a row.
           *
           * priority because this sits at the very top of every page and
           * would otherwise lazy-load into the largest-contentful paint.
           */}
          <Image
            src="/logo-256.png"
            alt=""
            width={256}
            height={256}
            priority
            className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
          />
          <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {dict.nav.brand}
          </span>
        </Link>

        <LanguageSwitcher current={locale} label={dict.nav.languageMenu} />
      </div>
    </header>
  );
}
