"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import {
  Link04Icon,
  ClipboardIcon,
  Download04Icon,
  Cancel01Icon,
} from "hugeicons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDownloader } from "@/hooks/use-downloader";
import { cn } from "@/lib/utils";
import { isTikTokUrl } from "@/lib/tiktok";

/**
 * URL input for the downloader. All state lives in DownloaderProvider, so
 * this component is purely presentational plus event wiring — the result
 * panel further down the page reads the same state.
 *
 * Submitting no longer navigates. The old flow pushed `?url=…` and let the
 * server render the result, which is exactly what made these pages
 * dynamic; now the provider posts to /api/fetch and the URL stays clean.
 * A side benefit: no per-video URLs get created, so there's nothing for
 * crawlers to index and nothing to mark noindex.
 */
export function DownloaderForm() {
  const { value, setValue, setLocalError, submit, status, errorMessage, formDict } =
    useDownloader();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const isPending = status === "loading";
  const isError = Boolean(errorMessage);

  async function handlePaste() {
    setLocalError(null);
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      // flushSync commits the new <input value> to the DOM before we kick
      // off the lookup — without it the field would still look empty while
      // the request is already running.
      flushSync(() => setValue(trimmed));
      if (isTikTokUrl(trimmed)) {
        submit(trimmed);
      } else {
        inputRef.current?.focus();
      }
    } catch {
      setLocalError(formDict.errorClipboard);
    }
  }

  function handleClear() {
    setValue("");
    inputRef.current?.focus();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <label htmlFor="tiktok-url" className="sr-only">
        {formDict.label}
      </label>

      <div className="flex flex-col gap-3 bg-primary p-4 sm:flex-row sm:items-stretch sm:rounded-xl sm:p-3 sm:shadow-card">
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
            name="url"
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder={formDict.placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-invalid={isError}
            aria-describedby="tiktok-url-status"
            disabled={isPending}
            className="ps-11 pe-32 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <div className="absolute inset-e-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {value ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label={formDict.clear}
                disabled={isPending}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-50"
              >
                <Cancel01Icon size={18} aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                disabled={isPending}
                className="inline-flex h-10 items-center gap-1.5 rounded-md bg-accent px-3 text-sm font-semibold text-accent-foreground hover:brightness-95 disabled:opacity-50"
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
          disabled={isPending}
          className="w-full text-foreground sm:w-auto sm:min-w-40"
        >
          <Download04Icon
            size={20}
            aria-hidden
            className={cn(isPending && "animate-pulse")}
          />
          {isPending ? formDict.submitting : formDict.submit}
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
        {isError ? errorMessage : null}
      </p>
    </form>
  );
}
