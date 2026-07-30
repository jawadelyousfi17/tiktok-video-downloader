"use client";

import * as React from "react";

import type { Dictionary } from "@/types/dictionary";
import type { DownloaderState } from "@/types/downloader";
import type { Locale } from "@/types/locale";

export interface DownloaderContextValue extends DownloaderState {
  /** Replace the input text. Clears any visible error as a side effect. */
  setValue: (value: string) => void;
  /** Show an error that didn't come from the API (e.g. clipboard denied). */
  setLocalError: (message: string | null) => void;
  /** Run a lookup. Defaults to the current input value. */
  submit: (raw?: string) => void;
  /** Clear the result and the input, back to the empty landing state. */
  reset: () => void;
  formDict: Dictionary["hero"]["form"];
  resultDict: Dictionary["result"];
  locale: Locale;
}

export const DownloaderContext = React.createContext<DownloaderContextValue | null>(
  null,
);

/**
 * Read the downloader state. The form and the result panel sit in
 * different parts of the page tree — the form lives inside the hero, the
 * result renders as its own section below it — so shared state travels
 * through context rather than props.
 *
 * @throws if called outside <DownloaderProvider>.
 */
export function useDownloader(): DownloaderContextValue {
  const ctx = React.useContext(DownloaderContext);
  if (!ctx) {
    throw new Error("useDownloader must be used inside <DownloaderProvider>");
  }
  return ctx;
}
