import type { IntroCopy as IntroCopyData } from "@/types/dictionary";

interface IntroCopyProps {
  data: IntroCopyData;
}

/**
 * Long-form body copy under the tool. This is the main block of indexable
 * text on the page, so it sits high in the document — right after the
 * downloader — rather than being buried at the bottom.
 *
 * Constrained to max-w-3xl because measured line length matters more than
 * filling the viewport when there's this much text to read.
 */
export function IntroCopy({ data }: IntroCopyProps) {
  return (
    <section className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {data.title}
        </h2>
        <div className="mt-6 space-y-5">
          {data.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="text-pretty text-base leading-relaxed text-muted-foreground"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
