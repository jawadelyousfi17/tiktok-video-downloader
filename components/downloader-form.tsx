"use client";

import { useRouter } from "next/navigation";
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
   * Server-side error message produced by normalizeForRender in the
   * parent page. The form just renders it underneath the input.
   */
  errorMessage?: string | null;
}

/**
 * URL input. Submits via Next's router.push() wrapped in useTransition
 * so the user gets immediate feedback the moment they click Download:
 *
 *  - useTransition.isPending flips the button label to "Working on it"
 *    and disables the input + paste/clear controls
 *  - Navigation to ?url=… makes the result-area Suspense flush its
 *    skeleton fallback, so the loading state is visible everywhere
 *    relevant in the same paint as the click
 *
 * The form keeps method="GET" and works without JS — if the handler
 * throws or JS is disabled, the browser does its own native submission
 * to the same URL with ?url=, which the server-rendered page handles
 * identically.
 */
export function DownloaderForm({
  formDict,
  initialUrl,
  errorMessage,
}: DownloaderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [value, setValue] = React.useState(initialUrl ?? "");
  const [clipboardError, setClipboardError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const formRef = React.useRef<HTMLFormElement | null>(null);

  // Track the last initialUrl we saw and resync `value` in render when it
  // changes — covers the "Download another video" reset link, where the
  // page re-renders without ?url= and the input should clear. Doing this
  // in render (the React-recommended pattern for "adjusting state from
  // props") avoids the cascading-render warning that comes with a
  // setValue inside useEffect.
  const [lastInitialUrl, setLastInitialUrl] = React.useState(initialUrl);
  if (lastInitialUrl !== initialUrl) {
    setLastInitialUrl(initialUrl);
    setValue(initialUrl ?? "");
  }

  const displayError = errorMessage ?? clipboardError;
  const isError =
    displayError !== null && displayError !== undefined && displayError.length > 0;

  function navigate(rawUrl: string) {
    const trimmed = rawUrl.trim();
    const search = trimmed
      ? `?${new URLSearchParams({ url: trimmed }).toString()}`
      : "";
    setClipboardError(null);
    startTransition(() => {
      // Empty `path` means router.push uses the current pathname; we
      // only swap the query string. That keeps a /mp3?url=… submit on
      // /mp3 and a /photos?url=… submit on /photos.
      router.push(search || ".");
    });
  }

  async function handlePaste() {
    setClipboardError(null);
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      // flushSync forces React to commit the new <input value> to the
      // DOM before we navigate — without it the input would briefly
      // show empty before the new query landed.
      flushSync(() => setValue(trimmed));
      if (isTikTokUrl(trimmed)) {
        navigate(trimmed);
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

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(value);
  }

  return (
    <form
      ref={formRef}
      method="GET"
      onSubmit={handleSubmit}
      noValidate
      className="w-full"
    >
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
        {isError ? displayError : null}
      </p>
    </form>
  );
}
