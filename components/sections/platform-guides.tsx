import {
  SmartPhone01Icon,
  AndroidIcon,
  ComputerIcon,
  AppleIcon,
} from "hugeicons-react";

import type { PlatformGuides as PlatformGuidesData } from "@/types/dictionary";

interface PlatformGuidesProps {
  data: PlatformGuidesData;
}

type GuideIcon = React.ComponentType<{
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
}>;

/**
 * Order matches dict.content.<page>.guides.platforms: iPhone, Android,
 * Windows, Mac. Add a platform to the dictionary and add its icon here.
 */
const ICONS: GuideIcon[] = [SmartPhone01Icon, AndroidIcon, ComputerIcon, AppleIcon];

/**
 * Emit HowTo structured data for the first platform.
 *
 * Only the first: Google treats one HowTo per page as the answer to
 * "how do I do this", and shipping four competing HowTo blocks tends to
 * get all of them ignored. The remaining platforms still rank as ordinary
 * body text, which is what they're really there for.
 */
function toJsonLd(data: PlatformGuidesData): string {
  const primary = data.platforms[0];
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `${data.title} — ${primary.name}`,
    description: data.subtitle,
    step: primary.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: step,
    })),
  };
  return JSON.stringify(schema);
}

/**
 * Per-device walkthroughs. Each block targets a distinct long-tail query
 * ("…on iPhone", "…on Android") that the generic hero copy can't reach.
 */
export function PlatformGuides({ data }: PlatformGuidesProps) {
  return (
    <section className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {data.title}
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {data.subtitle}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {data.platforms.map((platform, i) => {
            const Icon = ICONS[i] ?? SmartPhone01Icon;
            return (
              <article
                key={platform.name}
                className="rounded-lg border border-border bg-card p-6 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon size={22} aria-hidden />
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">
                    {platform.name}
                  </h3>
                </div>

                <ol className="mt-5 space-y-3">
                  {platform.steps.map((step, stepIndex) => (
                    <li key={step} className="flex gap-3 text-sm leading-relaxed">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                        {stepIndex + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>

        <script
          type="application/ld+json"
          // Built from typed dictionary strings, never user input.
          dangerouslySetInnerHTML={{ __html: toJsonLd(data) }}
        />
      </div>
    </section>
  );
}
