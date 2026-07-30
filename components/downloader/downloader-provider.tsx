"use client";

import * as React from "react";

import { DownloaderContext } from "@/hooks/use-downloader";
import type { DownloaderContextValue } from "@/hooks/use-downloader";
import { fetchErrorMessage } from "@/lib/i18n/fetch-error";
import { normalizeTikTokUrl } from "@/lib/tiktok";
import type { FetchApiResponse } from "@/types/api";
import type { Dictionary } from "@/types/dictionary";
import type { DownloaderStatus } from "@/types/downloader";
import type { Locale } from "@/types/locale";
import type { DownloadResult } from "@/types/tiktok";

interface DownloaderProviderProps {
  /**
   * Only the two slices the client actually needs, not the whole
   * dictionary. Everything passed here crosses the server/client boundary
   * and ends up in the page payload — the long-form SEO copy is several
   * times larger than this and has no business being shipped twice.
   */
  formDict: Dictionary["hero"]["form"];
  resultDict: Dictionary["result"];
  locale: Locale;
  children: React.ReactNode;
}

/**
 * Owns the lookup state for a landing page and runs the actual request.
 *
 * Why this is a client island wrapping server-rendered children: the page
 * itself must not read `?url=` during render, because any request-time
 * input would force Next to render the route on demand and we'd lose the
 * prerendered HTML that the whole SEO setup depends on. So the URL never
 * enters the address bar at all — it goes straight to /api/fetch from the
 * browser and the result renders client-side underneath the hero. The
 * hero, features, FAQ and long-form copy passed in as `children` are still
 * plain server components; they just render inside this provider.
 */
export function DownloaderProvider({
  formDict,
  resultDict,
  locale,
  children,
}: DownloaderProviderProps) {
  const [value, setValueState] = React.useState("");
  const [status, setStatus] = React.useState<DownloaderStatus>("idle");
  const [result, setResult] = React.useState<DownloadResult | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Lets a second submit cancel the first. Without it, a slow response for
  // an abandoned URL could land after a newer one and overwrite the card
  // the user is actually looking at.
  const inFlight = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    return () => inFlight.current?.abort();
  }, []);

  const setValue = React.useCallback((next: string) => {
    setValueState(next);
    setErrorMessage(null);
  }, []);

  const setLocalError = React.useCallback((message: string | null) => {
    setErrorMessage(message);
  }, []);

  const reset = React.useCallback(() => {
    inFlight.current?.abort();
    inFlight.current = null;
    setValueState("");
    setResult(null);
    setErrorMessage(null);
    setStatus("idle");
  }, []);

  const submit = React.useCallback(
    (raw?: string) => {
      const candidate = (raw ?? value).trim();

      if (!candidate) {
        setResult(null);
        setStatus("error");
        setErrorMessage(formDict.errorEmpty);
        return;
      }

      // Validate before spending a request. Same function the API route
      // runs, so a URL that passes here won't be rejected server-side for
      // a different reason.
      const normalized = normalizeTikTokUrl(candidate);
      if (!normalized) {
        setResult(null);
        setStatus("error");
        setErrorMessage(formDict.errorInvalid);
        return;
      }

      inFlight.current?.abort();
      const controller = new AbortController();
      inFlight.current = controller;

      setStatus("loading");
      setResult(null);
      setErrorMessage(null);

      void (async () => {
        try {
          const response = await fetch("/api/fetch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: normalized }),
            signal: controller.signal,
          });

          const payload = (await response.json()) as FetchApiResponse;
          if (controller.signal.aborted) return;

          if (payload.ok) {
            setResult(payload.result);
            setStatus("success");
            return;
          }

          setResult(null);
          setStatus("error");
          setErrorMessage(fetchErrorMessage(payload.code, formDict));
        } catch (err) {
          // An abort is us replacing this request, not a failure the user
          // should ever see — the newer request owns the UI now.
          if (controller.signal.aborted || (err as Error)?.name === "AbortError") return;
          setResult(null);
          setStatus("error");
          setErrorMessage(formDict.errorServer);
        } finally {
          if (inFlight.current === controller) inFlight.current = null;
        }
      })();
    },
    [value, formDict],
  );

  const contextValue: DownloaderContextValue = React.useMemo(
    () => ({
      value,
      status,
      result,
      errorMessage,
      setValue,
      setLocalError,
      submit,
      reset,
      formDict,
      resultDict,
      locale,
    }),
    [
      value,
      status,
      result,
      errorMessage,
      setValue,
      setLocalError,
      submit,
      reset,
      formDict,
      resultDict,
      locale,
    ],
  );

  return (
    <DownloaderContext.Provider value={contextValue}>
      {children}
    </DownloaderContext.Provider>
  );
}
