import type { SpecTable as SpecTableData } from "@/types/dictionary";

interface SpecTableProps {
  data: SpecTableData;
}

/**
 * "What you get" specification table.
 *
 * Rendered as a real <table> with a proper <thead> — Google needs the
 * semantic markup to lift it into a featured snippet, and screen readers
 * need it to announce row/column relationships. On narrow screens the
 * table scrolls inside its own container rather than squashing columns,
 * so the page body never scrolls sideways.
 */
export function SpecTable({ data }: SpecTableProps) {
  return (
    <section className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {data.title}
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {data.subtitle}
          </p>
        </div>

        <div className="mt-12 overflow-x-auto rounded-lg border border-border bg-card shadow-card">
          <table className="w-full min-w-[36rem] border-collapse text-start text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th scope="col" className="px-5 py-4 text-start font-semibold text-foreground">
                  {data.columns.feature}
                </th>
                <th scope="col" className="px-5 py-4 text-start font-semibold text-foreground">
                  {data.columns.value}
                </th>
                <th scope="col" className="px-5 py-4 text-start font-semibold text-foreground">
                  {data.columns.note}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.feature} className="border-b border-border/60 last:border-0">
                  <th
                    scope="row"
                    className="px-5 py-4 text-start align-top font-medium text-foreground"
                  >
                    {row.feature}
                  </th>
                  <td className="px-5 py-4 align-top font-medium text-primary">
                    {row.value}
                  </td>
                  <td className="px-5 py-4 align-top leading-relaxed text-muted-foreground">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
