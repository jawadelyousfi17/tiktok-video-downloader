"use client";

import * as React from "react";

import { DownloadResult as ResultCard } from "@/components/download-result";
import { ResultLoader } from "@/components/result-loader";
import { useDownloader } from "@/hooks/use-downloader";

/**
 * Renders whatever the current lookup produced: a skeleton while the
 * request is in flight, an error notice, or the result card. Renders
 * nothing at all in the idle state, so the prerendered landing page is
 * byte-identical to what a crawler sees.
 *
 * Errors surface here rather than only in the form because by the time a
 * response comes back the user has usually scrolled down to watch for the
 * result, and a message hidden under the input would be missed.
 */
export function ResultPanel() {
  const { status, result, errorMessage, reset, resultDict, locale } = useDownloader();
  const sectionRef = React.useRef<HTMLElement | null>(null);

  // Bring the result area into view once there's something to look at.
  // Skipped while idle so the page doesn't jump on first load.
  React.useEffect(() => {
    if (status === "idle") return;
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [status]);

  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <section ref={sectionRef} id="result" className="scroll-mt-16">
        <ResultLoader />
      </section>
    );
  }

  if (status === "error") {
    return (
      <section
        ref={sectionRef}
        id="result"
        className="mx-auto max-w-3xl scroll-mt-16 px-4 pb-12 sm:px-6"
      >
        <div className="rounded-lg border border-danger/40 bg-card p-6 text-center shadow-card">
          <p className="text-base font-medium text-danger">{errorMessage}</p>
        </div>
      </section>
    );
  }

  if (!result) return null;

  return (
    <section
      ref={sectionRef}
      id="result"
      className="mx-auto -mt-2 max-w-3xl scroll-mt-16 px-4 pb-12 sm:px-6"
    >
      <ResultCard
        result={result}
        dict={resultDict}
        locale={locale}
        onReset={reset}
      />
    </section>
  );
}
