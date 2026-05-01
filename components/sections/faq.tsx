import { ArrowDown01Icon } from "hugeicons-react";

import type { FaqSection as FaqSectionData } from "@/types/dictionary";

interface FaqSectionProps {
  data: FaqSectionData;
}

/**
 * Build the FAQPage JSON-LD payload Google reads to surface rich FAQ
 * results. Kept inline so it always matches the visible content — if
 * either drifted, the structured data would lie about the page.
 */
function toJsonLd(data: FaqSectionData): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  // JSON.stringify is enough because every dictionary string is plain
  // text; we don't substitute it into HTML, just into a JSON literal.
  return JSON.stringify(schema);
}

/**
 * SEO-friendly FAQ section. Uses native <details>/<summary> so the
 * accordion behavior, keyboard navigation, and screen-reader semantics
 * come for free — no JS, no external dependency, no client island.
 */
export function FaqSection({ data }: FaqSectionProps) {
  return (
    <section className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="mb-8 text-balance text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          {data.sectionTitle}
        </h2>

        <ul className="space-y-3">
          {data.items.map((item) => (
            <li key={item.question}>
              <details className="group rounded-lg border border-border bg-card p-5 shadow-card open:pb-6">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold text-foreground sm:text-lg">
                  <span className="text-pretty">{item.question}</span>
                  <ArrowDown01Icon
                    size={20}
                    aria-hidden
                    className="mt-0.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {item.answer}
                </p>
              </details>
            </li>
          ))}
        </ul>

        <script
          type="application/ld+json"
          // The schema content is built from typed dictionary strings,
          // not user input, so this dangerouslySet is safe.
          dangerouslySetInnerHTML={{ __html: toJsonLd(data) }}
        />
      </div>
    </section>
  );
}
