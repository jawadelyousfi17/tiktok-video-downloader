"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe02Icon, ArrowDown01Icon } from "hugeicons-react";

import { cn } from "@/lib/utils";
import { defaultLocale, locales } from "@/lib/i18n/config";
import type { Locale } from "@/types/locale";

interface LanguageSwitcherProps {
  current: Locale;
  label: string;
}

/**
 * Strip any leading locale segment from the current pathname so the switcher
 * can rebuild the same route under another locale. Without this, switching
 * from /fr/about to Spanish would land on /es/fr/about.
 */
function withoutLocale(pathname: string): string {
  for (const { code } of locales) {
    if (code === defaultLocale) continue;
    if (pathname === `/${code}`) return "/";
    if (pathname.startsWith(`/${code}/`)) return pathname.slice(`/${code}`.length);
  }
  return pathname || "/";
}

function buildHref(target: Locale, basePath: string): string {
  if (target === defaultLocale) return basePath === "" ? "/" : basePath;
  return basePath === "/" ? `/${target}` : `/${target}${basePath}`;
}

export function LanguageSwitcher({ current, label }: LanguageSwitcherProps) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const currentMeta = locales.find((l) => l.code === current);

  React.useEffect(() => {
    if (!open) return;
    function onClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const basePath = withoutLocale(pathname);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground",
          "hover:bg-muted transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {currentMeta?.flag ? (
          <span aria-hidden className="text-base leading-none">
            {currentMeta.flag}
          </span>
        ) : (
          <Globe02Icon size={18} aria-hidden />
        )}
        <span className="hidden sm:inline">{currentMeta?.nativeName ?? current}</span>
        <span className="sm:hidden uppercase">{current}</span>
        <ArrowDown01Icon size={16} aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 mt-2 w-56 max-h-80 overflow-auto rounded-md border border-border bg-card p-1 shadow-lg z-50"
        >
          {locales.map((locale) => {
            const href = buildHref(locale.code, basePath);
            const isCurrent = locale.code === current;
            return (
              <Link
                key={locale.code}
                href={href}
                hrefLang={locale.htmlLang}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-sm px-3 py-2 text-sm",
                  "hover:bg-muted",
                  isCurrent && "bg-muted font-semibold",
                )}
              >
                <span className="inline-flex items-center gap-2.5">
                  <span aria-hidden className="text-base leading-none">
                    {locale.flag}
                  </span>
                  <span>{locale.nativeName}</span>
                </span>
                <span className="text-xs uppercase text-muted-foreground">{locale.code}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
