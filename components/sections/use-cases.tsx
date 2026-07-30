import { Briefcase01Icon, PaintBrush01Icon, BookOpen01Icon } from "hugeicons-react";

import type { UseCases as UseCasesData } from "@/types/dictionary";

interface UseCasesProps {
  data: UseCasesData;
}

type UseCaseIcon = React.ComponentType<{
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
}>;

/** Order matches dict.content.<page>.useCases.items. */
const ICONS: UseCaseIcon[] = [Briefcase01Icon, PaintBrush01Icon, BookOpen01Icon];

/**
 * Why-people-use-this section. Reads as reasons rather than features, and
 * naturally carries intent phrasing ("save a clip for a client deck")
 * that feature bullets never pick up.
 */
export function UseCases({ data }: UseCasesProps) {
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

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item, i) => {
            const Icon = ICONS[i] ?? Briefcase01Icon;
            return (
              <li
                key={item.title}
                className="rounded-lg border border-border bg-card p-6 shadow-card"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon size={22} aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
