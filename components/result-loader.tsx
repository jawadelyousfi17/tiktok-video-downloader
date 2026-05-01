/**
 * Skeleton mirroring the real result card. Used in two places:
 *   1. app/[lang]/loading.tsx — Next soft-navigation indicator
 *   2. The Suspense fallback inside variant pages — flushes immediately
 *      while the upstream RapidAPI fetch is in flight
 *
 * The wrapper / article / inner layout match the live <DownloadResult>
 * exactly, so the swap between skeleton and real result causes zero
 * layout shift. Only the inner content blocks are pulse placeholders.
 */
export function ResultLoader() {
  return (
    <section className="mx-auto max-w-3xl px-4 pb-12 pt-6 sm:px-6 sm:pt-2">
      <article className="rounded-none border border-border bg-card p-4 shadow-card sm:rounded-lg sm:p-6">
        {/* "Download another video" button placeholder, top-end */}
        <div className="mb-4 flex justify-end">
          <div className="h-9 w-44 animate-pulse rounded-md bg-muted" />
        </div>

        <div className="flex flex-col gap-5 sm:flex-row">
          {/* Cover thumbnail */}
          <div className="h-56 w-full shrink-0 animate-pulse rounded-md bg-muted sm:h-56 sm:w-40" />

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {/* Author row */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>

            {/* Title — two lines, second a touch shorter to feel real */}
            <div className="space-y-2 pt-1">
              <div className="h-5 w-full animate-pulse rounded bg-muted" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 pt-1">
              <div className="h-4 w-14 animate-pulse rounded bg-muted" />
              <div className="h-4 w-14 animate-pulse rounded bg-muted" />
            </div>

            {/* Download button bars */}
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <div className="h-11 w-full animate-pulse rounded-md bg-muted sm:w-44" />
              <div className="h-11 w-full animate-pulse rounded-md bg-muted sm:w-44" />
              <div className="h-11 w-full animate-pulse rounded-md bg-muted sm:w-44" />
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
