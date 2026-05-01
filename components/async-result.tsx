import { DownloadResult as ResultCard } from "@/components/download-result";
import { ScrollToResult } from "@/components/scroll-to-result";
import { fetchAfterNormalize } from "@/services/render-fetch";
import type { Dictionary } from "@/types/dictionary";
import type { Locale } from "@/types/locale";

interface AsyncResultProps {
  /** Normalized https TikTok URL — caller validates synchronously. */
  url: string;
  dict: Dictionary;
  locale: Locale;
  /** Page URL without ?url=, for the "Download another video" button. */
  resetHref: string;
}

/**
 * Async server component that runs inside a Suspense boundary. The
 * surrounding page can flush its shell (form, hero, features, FAQ)
 * immediately while this component awaits the upstream fetch — Next
 * streams the result chunk in once ready. During the wait the page's
 * Suspense fallback (<ResultLoader />) is what the user sees.
 *
 * Errors from the upstream fetch render a small notice card here
 * rather than going back to the form, so users can read what went
 * wrong without losing their place on the page.
 */
export async function AsyncResult({ url, dict, locale, resetHref }: AsyncResultProps) {
  const outcome = await fetchAfterNormalize(url, dict);

  if (outcome.errorMessage) {
    return (
      <section
        id="result"
        className="mx-auto max-w-3xl scroll-mt-16 px-4 pb-12 sm:px-6"
      >
        <div className="rounded-lg border border-danger/40 bg-card p-6 text-center shadow-card">
          <p className="text-base font-medium text-danger">{outcome.errorMessage}</p>
        </div>
        <ScrollToResult />
      </section>
    );
  }

  if (outcome.result) {
    return (
      <section
        id="result"
        className="mx-auto -mt-2 max-w-3xl scroll-mt-16 px-4 pb-12 sm:px-6"
      >
        <ResultCard
          result={outcome.result}
          dict={dict.result}
          locale={locale}
          resetHref={resetHref}
        />
        <ScrollToResult />
      </section>
    );
  }

  return null;
}
