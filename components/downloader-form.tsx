"use client";

import * as React from "react";
import {
  Link04Icon,
  ClipboardIcon,
  Download04Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from "hugeicons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DownloadResult as ResultCard } from "@/components/download-result";
import { cn } from "@/lib/utils";
import { isTikTokUrl, normalizeTikTokUrl } from "@/lib/tiktok";
import type { Dictionary } from "@/types/dictionary";
import type { Locale } from "@/types/locale";
import type { DownloadResult } from "@/types/tiktok";

interface DownloaderFormProps {
  formDict: Dictionary["hero"]["form"];
  resultDict: Dictionary["result"];
  locale: Locale;
}

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "ready"; result: DownloadResult };

/** Server response shape for /api/fetch. Kept inline to avoid a tiny shared type file. */
interface FetchOk {
  ok: true;
  result: DownloadResult;
}
interface FetchErr {
  ok: false;
  code: "invalid-url" | "not-found" | "rate-limited" | "server" | "missing-config";
}
type FetchResponse = FetchOk | FetchErr;

export function DownloaderForm({ formDict, resultDict, locale }: DownloaderFormProps) {
  const [value, setValue] = React.useState("");
  const [status, setStatus] = React.useState<Status>({ kind: "idle" });
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const resultRef = React.useRef<HTMLDivElement | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  // Drop any in-flight request when the component unmounts so we don't try
  // to setState on an unmounted form during dev navigation.
  React.useEffect(() => () => abortRef.current?.abort(), []);

  // When a result lands, scroll the result card itself to the very top
  // of the viewport. Aligning the page (y=0) instead would leave the
  // result card stuck below the form. The user explicitly does not want
  // the sticky navbar offset baked in — the card sliding under the
  // navbar at y=0 is the desired outcome.
  React.useEffect(() => {
    if (status.kind !== "ready") return;
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [status.kind]);

  // Derive the "looks like a TikTok URL" hint instead of mirroring it into
  // state — keeps the source of truth in one place.
  const looksValid = value.trim().length > 0 && isTikTokUrl(value);

  function handleClear() {
    setValue("");
    setStatus({ kind: "idle" });
    inputRef.current?.focus();
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
    if (status.kind === "error") setStatus({ kind: "idle" });
  }

  function errorMessageFor(code: FetchErr["code"]): string {
    switch (code) {
      case "invalid-url":
        return formDict.errorInvalid;
      case "not-found":
        return formDict.errorFetch;
      case "rate-limited":
        return formDict.errorRateLimit;
      default:
        return formDict.errorServer;
    }
  }

  /**
   * Run the fetch against /api/fetch with the given URL. Shared by the
   * explicit submit button and the paste auto-submit, so users get the
   * same validation and abort behavior either way.
   */
  async function runFetch(rawUrl: string) {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      setStatus({ kind: "error", message: formDict.errorEmpty });
      return;
    }
    // Normalize before posting so a paste like "tiktok.com/@user/..."
    // arrives at the API as a fully-formed https URL. The function
    // returns null for non-TikTok input, which doubles as the validity
    // check we used to do separately.
    const normalized = normalizeTikTokUrl(trimmed);
    if (!normalized) {
      setStatus({ kind: "error", message: formDict.errorInvalid });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus({ kind: "submitting" });

    try {
      const response = await fetch("/api/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
        signal: controller.signal,
      });
      const payload = (await response.json()) as FetchResponse;
      if (!payload.ok) {
        setStatus({ kind: "error", message: errorMessageFor(payload.code) });
        return;
      }
      setStatus({ kind: "ready", result: payload.result });
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      setStatus({ kind: "error", message: formDict.errorServer });
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      setValue(trimmed);
      setStatus({ kind: "idle" });
      // Auto-fire the fetch when the clipboard already contains a valid
      // TikTok URL — skips a redundant tap on Download for the most
      // common flow ("share → paste → save").
      if (isTikTokUrl(trimmed)) {
        void runFetch(trimmed);
      } else {
        inputRef.current?.focus();
      }
    } catch {
      setStatus({ kind: "error", message: formDict.errorClipboard });
    }
  }

  // Inlined-ish handler: accepts the event from the JSX onSubmit callback
  // without naming the deprecated React.FormEventHandler alias.
  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    void runFetch(value);
  }

  function handleReset() {
    setValue("");
    setStatus({ kind: "idle" });
    inputRef.current?.focus();
  }

  const isError = status.kind === "error";
  const isSubmitting = status.kind === "submitting";
  const isReady = status.kind === "ready";
  const showReadyHint = looksValid && status.kind === "idle";

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="tiktok-url" className="sr-only">
          {formDict.label}
        </label>

        <div className="flex flex-col gap-3 bg-primary p-4 sm:flex-row sm:items-stretch sm:rounded-xl sm:shadow-card">
          <div
            className={cn(
              "relative flex-1 rounded-md bg-card",
              isError
                ? "ring-2 ring-danger"
                : "focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-primary",
            )}
          >
            <Link04Icon
              size={18}
              aria-hidden
              className="pointer-events-none absolute inset-s-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="tiktok-url"
              ref={inputRef}
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder={formDict.placeholder}
              value={value}
              onChange={handleChange}
              aria-invalid={isError}
              aria-describedby="tiktok-url-status"
              disabled={isSubmitting}
              className="ps-11 pe-32 border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <div className="absolute inset-e-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {value ? (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label={formDict.clear}
                  disabled={isSubmitting}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                >
                  <Cancel01Icon size={18} aria-hidden />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="inline-flex h-10 items-center gap-1.5 rounded-md bg-accent px-3 text-sm font-semibold text-accent-foreground hover:brightness-95"
                >
                  <ClipboardIcon size={16} aria-hidden />
                  <span>{formDict.paste}</span>
                </button>
              )}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            variant="accent"
            disabled={isSubmitting}
            className="w-full text-foreground sm:w-auto sm:min-w-40"
          >
            <Download04Icon size={20} aria-hidden />
            {isSubmitting ? formDict.submitting : formDict.submit}
          </Button>
        </div>

        <p
          id="tiktok-url-status"
          role={isError ? "alert" : undefined}
          aria-live="polite"
          className={cn(
            "mt-3 min-h-5 px-1 text-sm",
            isError ? "text-danger" : "text-muted-foreground",
          )}
        >
          {isError ? (
            status.message
          ) : showReadyHint ? (
            <span className="inline-flex items-center gap-2 text-foreground/80">
              <CheckmarkCircle02Icon size={16} aria-hidden className="text-primary" />
              {formDict.successHint}
            </span>
          ) : null}
        </p>
      </form>

      {isReady ? (
        // scroll-mt-16 matches the sticky <SiteHeader> height (h-16, 64px)
        // so scrollIntoView({block: "start"}) lands the card just below
        // the navbar instead of underneath it. Bump this in lockstep
        // with the header height token.
        <div ref={resultRef} className="mt-6 scroll-mt-16 text-start">
          <ResultCard
            result={status.result}
            dict={resultDict}
            locale={locale}
            onReset={handleReset}
          />
        </div>
      ) : null}
    </div>
  );
}
