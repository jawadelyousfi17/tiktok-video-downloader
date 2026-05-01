import { Copy01Icon, ClipboardIcon, Download04Icon } from "hugeicons-react";

import type { Dictionary } from "@/types/dictionary";

interface HowItWorksProps {
  dict: Dictionary;
}

type StepIcon = React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;

const ICONS: StepIcon[] = [Copy01Icon, ClipboardIcon, Download04Icon];

export function HowItWorks({ dict }: HowItWorksProps) {
  return (
    <section className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            {dict.how.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {dict.how.title}
          </h2>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {dict.how.steps.map((step, i) => {
            const Icon = ICONS[i] ?? Copy01Icon;
            return (
              <li
                key={step.title}
                className="relative rounded-lg border border-border bg-card p-6 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold">
                    {i + 1}
                  </span>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary-soft text-primary">
                    <Icon size={18} aria-hidden />
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
