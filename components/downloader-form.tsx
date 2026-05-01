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
import { cn } from "@/lib/utils";
import { isTikTokUrl } from "@/lib/tiktok";
import type { Dictionary } from "@/types/dictionary";

interface DownloaderFormProps {
  formDict: Dictionary["hero"]["form"];
  /** Pre-fills the input from ?url=… when the user is on a result render. */
  initialUrl?: string | null;
  /**
   * Server-side error message produced by fetchForPage in the parent
   * page. The form just renders it underneath the input — no client
   * roundtrip, so the message survives a page reload.
   */
  errorMessage?: string | null;
}

/**
 * URL input. Submits as a plain HTML <form method="GET">, which means
 * the browser navigates to ?url=… and the parent server component
 * fetches + renders the result. The only client interactivity is the
 * paste / clear UX and the auto-submit when the clipboard already
 * contains a valid TikTok URL — everything else is just the browser
 * doing its thing.
 */
export function DownloaderForm({
  formDict,
  initialUrl,
  errorMessage,
}: DownloaderFormProps) {
  const [value, setValue] = React.useState(initialUrl ?? "");
  const [clipboardError, setClipboardError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const formRef = React.useRef<HTMLFormElement | null>(null);

  // Display the parent's error first; only fall through to a clipboard
  // failure when the parent didn't have anything to say.
  const displayError = errorMessage ?? clipboardError;
  const isError = displayError !== null && displayError !== undefined && displayError.length > 0;

  async function handlePaste() {
    setClipboardError(null);
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      // flushSync forces React to commit the new <input value> to the DOM
      // before requestSubmit() — without it the form would still submit
      // the old (empty) value because React batches updates.
      flushSync(() => setValue(trimmed));
      if (isTikTokUrl(trimmed)) {
        formRef.current?.requestSubmit();
      } else {
        inputRef.current?.focus();
      }
    } catch {
      setClipboardError(formDict.errorClipboard);
    }
  }

  function handleClear() {
    setValue("");
    setClipboardError(null);
    inputRef.current?.focus();
  }

  return (
    <form ref={formRef} method="GET" noValidate className="w-full">
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
            onChange={(e) => {
              setValue(e.target.value);
              setClipboardError(null);
            }}
            aria-invalid={isError}
            aria-describedby="tiktok-url-status"
            className="ps-11 pe-32 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <div className="absolute inset-e-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {value ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label={formDict.clear}
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
          className="w-full text-foreground sm:w-auto sm:min-w-40"
        >
          <Download04Icon size={20} aria-hidden />
          {formDict.submit}
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
        {isError ? displayError : null}
      </p>
    </form>
  );
}
