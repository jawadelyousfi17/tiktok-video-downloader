import { Shield01Icon, FlashIcon, MusicNote01Icon } from "hugeicons-react";

import type { Dictionary } from "@/types/dictionary";

interface FeaturesProps {
  dict: Dictionary;
}

type FeatureIcon = React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;

/**
 * Order matches the order of dict.features.items so the icons line up
 * with the translated copy. If you add an item, add an icon here too.
 */
const ICONS: FeatureIcon[] = [Shield01Icon, FlashIcon, MusicNote01Icon];

export function Features({ dict }: FeaturesProps) {
  return (
    <section className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            {dict.features.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {dict.features.title}
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {dict.features.subtitle}
          </p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dict.features.items.map((item, i) => {
            const Icon = ICONS[i] ?? Shield01Icon;
            return (
              <li
                key={item.title}
                className="rounded-lg border border-border bg-card p-6 shadow-card"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon size={22} aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
