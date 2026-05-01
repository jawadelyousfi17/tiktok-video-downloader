import {
  CheckmarkCircle02Icon,
  Shield01Icon,
  FlashIcon,
  SparklesIcon,
} from "hugeicons-react";

import { DownloaderForm } from "@/components/downloader-form";
import type { Dictionary } from "@/types/dictionary";
import type { Locale } from "@/types/locale";

interface HeroProps {
  dict: Dictionary;
  locale: Locale;
  /**
   * Optional H1 override. Variant landing pages (/mp3, /photos,
   * /carousel) pass their own keyword-targeted heading here so the home
   * page's hero.title is not duplicated across the site for SEO.
   */
  heading?: string;
  /** Optional subtitle override matching the variant H1. */
  description?: string;
}

/**
 * Mobile-first landing section. The H1 is keyword-direct ("Download
 * TikTok videos without watermark") and sits directly above the form so
 * Google reads it as the page heading and humans see SEO copy paired
 * with the primary action. There's only one heading on the page now —
 * the old marketing-style hero block was removed to avoid duplication.
 */
export function Hero({ dict, locale, heading, description }: HeroProps) {
  const headingText = heading ?? dict.hero.title;
  const descriptionText = description ?? dict.hero.subtitle;
  const trustBadges = [
    { icon: Shield01Icon, label: dict.hero.trust.noWatermark },
    { icon: SparklesIcon, label: dict.hero.trust.hd },
    { icon: FlashIcon, label: dict.hero.trust.free },
    { icon: CheckmarkCircle02Icon, label: dict.hero.trust.private },
  ] as const;

  return (
    <section className="bg-background">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 pt-5 pb-12 text-center sm:max-w-4xl sm:gap-7 sm:px-6 sm:pt-12 sm:pb-20">
        {/* <span className="inline-flex items-center gap-2 rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground sm:px-4 sm:py-1.5 sm:text-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          {dict.hero.badge}
        </span> */}

        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {headingText}
          </h1>
          <p className="max-w-xl text-pretty text-sm text-muted-foreground sm:text-base md:text-lg">
            {descriptionText}
          </p>
        </div>

        {/*
         * Mobile: -mx-4 cancels the parent container's px-4 so the green
         * form panel goes edge-to-edge for thumb-friendly tapping.
         * Desktop: mx-0 reverts to the contained max-width.
         */}
        <div className="-mx-4 w-screen sm:mx-0 sm:w-full sm:max-w-2xl">
          <DownloaderForm
            formDict={dict.hero.form}
            resultDict={dict.result}
            locale={locale}
          />
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:gap-x-6 sm:gap-y-3 sm:text-sm">
          {trustBadges.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-2">
              <Icon size={14} aria-hidden className="text-primary" />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
