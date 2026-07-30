/**
 * Route-transition skeleton. Mirrors the hero block — heading, subtitle,
 * form panel, trust row — because that's what sits above the fold on every
 * landing page, so the swap to real content lands in roughly the same
 * place and nothing jumps.
 *
 * Deliberately not the result skeleton: the pages are prerendered and no
 * longer fetch anything during navigation, so showing a download card
 * placeholder would promise a result that isn't coming.
 */
export function PageLoader() {
  return (
    <section className="bg-background">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 pt-5 pb-12 sm:max-w-4xl sm:gap-7 sm:px-6 sm:pt-12 sm:pb-20">
        <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
          <div className="h-9 w-4/5 animate-pulse rounded bg-muted sm:h-12" />
          <div className="h-9 w-2/3 animate-pulse rounded bg-muted sm:h-12" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-muted sm:h-5 sm:w-1/2" />
        </div>

        <div className="-mx-4 w-screen sm:mx-0 sm:w-full sm:max-w-2xl">
          <div className="flex flex-col gap-3 bg-primary p-4 sm:flex-row sm:rounded-xl sm:p-3 sm:shadow-card">
            <div className="h-12 flex-1 animate-pulse rounded-md bg-card/60" />
            <div className="h-12 w-full animate-pulse rounded-md bg-card/40 sm:w-40" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-24 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    </section>
  );
}
