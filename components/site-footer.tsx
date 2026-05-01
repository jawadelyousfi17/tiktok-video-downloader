import Image from "next/image";
import Link from "next/link";

import { localePath } from "@/lib/i18n/config";
import type { Dictionary } from "@/types/dictionary";
import type { Locale } from "@/types/locale";

interface SiteFooterProps {
  dict: Dictionary;
  locale: Locale;
}

/**
 * Footer. Renders the brand block, an internal-link row pointing at every
 * TikTok-tool variant page (home / mp3 / photos / carousel) for SEO
 * crawlability, plus the legal disclaimer. Year is server-rendered to
 * keep the page fully static — switch to a client island only if a live
 * year ever becomes a real requirement.
 */
export function SiteFooter({ dict, locale }: SiteFooterProps) {
  const year = new Date().getFullYear();

  const tools = [
    { href: localePath(locale, "/"), label: dict.tools.home },
    { href: localePath(locale, "/mp3"), label: dict.tools.mp3 },
    { href: localePath(locale, "/photos"), label: dict.tools.photos },
    { href: localePath(locale, "/carousel"), label: dict.tools.carousel },
  ];

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            {/*
             * Logo asset already includes the wordmark, so no separate
             * brand text. Slightly larger than the header copy because
             * footer breathing room allows it.
             */}
            <Image
              src="/logo.png"
              alt={dict.nav.brand}
              width={160}
              height={160}
              className="h-16 w-16 object-contain"
            />
            <p className="max-w-md text-sm text-muted-foreground">{dict.footer.tagline}</p>
          </div>

          <nav aria-label={dict.tools.sectionLabel} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {dict.tools.sectionLabel}
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              {tools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="text-foreground/80 hover:text-foreground hover:underline"
                  >
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 space-y-2 border-t border-border/60 pt-6 text-sm text-muted-foreground">
          <p>
            © {year} {dict.nav.brand}. {dict.footer.rights}
          </p>
          <p className="max-w-2xl">{dict.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
