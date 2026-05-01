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
 * The logo asset (public/logo.png) bundles the icon and the TikSaver
 * wordmark together, so we render it alone — no separate brand text or
 * tagline next to it would just duplicate what the image already says.
 */
export function SiteHeader({ locale, dict }: SiteHeaderProps) {
  const home = localePath(locale, "/");
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={home}
          hrefLang={locale === defaultLocale ? "en" : locale}
          className="inline-flex items-center"
        >
          <img
            src="/logo.png"
            alt={dict.nav.brand}
            className="h-16 object-contain"
          />
        </Link>

        <LanguageSwitcher current={locale} label={dict.nav.languageMenu} />
      </div>
    </header>
  );
}
