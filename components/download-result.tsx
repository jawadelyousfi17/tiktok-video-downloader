"use client";

import * as React from "react";
import {
  Download04Icon,
  MusicNote01Icon,
  Image01Icon,
  Clock01Icon,
  ReloadIcon,
  EyeIcon,
  FavouriteIcon,
} from "hugeicons-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBytes, formatCount } from "@/lib/format";
import type { Dictionary } from "@/types/dictionary";
import type { DownloadOption, DownloadResult } from "@/types/tiktok";

interface DownloadResultProps {
  result: DownloadResult;
  dict: Dictionary["result"];
  locale: string;
  /**
   * Clears the result and empties the input. A callback rather than a
   * link because the lookup no longer lives in the URL — there's nothing
   * to navigate back to, we just drop the state.
   */
  onReset: () => void;
}

/**
 * Build the URL for our streaming proxy. Going through /api/download is
 * what makes the browser actually save the file — a direct cross-origin
 * link with the `download` attribute would just open in a new tab.
 */
function downloadHref(option: DownloadOption): string {
  const params = new URLSearchParams({ u: option.url, filename: option.filename });
  return `/api/download?${params.toString()}`;
}

function photoHref(url: string, filename: string): string {
  const params = new URLSearchParams({ u: url, filename });
  return `/api/download?${params.toString()}`;
}

/**
 * Result card. Renders the cover, author, stats, and a primary list of
 * download buttons (HD video, standard video, audio). For slideshow posts
 * it falls back to a photo grid with per-image save buttons.
 */
export function DownloadResult({ result, dict, locale, onReset }: DownloadResultProps) {
  const isSlideshow = result.photos.length > 0 && result.videos.length === 0;
  const hd = result.videos.find((v) => v.kind === "video-hd");
  const sd = result.videos.find((v) => v.kind === "video-sd");
  const [zipping, setZipping] = React.useState(false);

  /**
   * Bundle the slideshow photos into a single ZIP via /api/download-zip
   * and trigger the browser save. We buffer to a Blob (rather than piping
   * a stream) because that's the only universally supported way to
   * trigger an "attachment" save from a POST response. For 20–40 photos
   * the buffered size stays comfortably under typical mobile memory.
   */
  async function handleDownloadAll() {
    if (zipping) return;
    setZipping(true);
    try {
      const response = await fetch("/api/download-zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: result.photos,
          filename: `tiktok-${result.id}-photos`,
        }),
      });
      if (!response.ok) return;
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `tiktok-${result.id}-photos.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } finally {
      setZipping(false);
    }
  }

  return (
    <article className="rounded-none md:rounded-lg border border-border bg-card p-4 shadow-card sm:p-6">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted"
        >
          <ReloadIcon size={14} aria-hidden />
          {dict.newSearch}
        </button>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="relative w-full shrink-0 overflow-hidden rounded-md bg-muted sm:h-56 sm:w-40">
          {result.cover ? (
            <img
              src={result.cover}
              alt=""
              className="h-56 w-full object-cover sm:h-full"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : null}
          {result.durationSeconds ? (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-sm bg-foreground/80 px-1.5 py-0.5 text-xs font-medium text-background">
              <Clock01Icon size={12} aria-hidden />
              {result.durationSeconds}
              {dict.seconds}
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {result.author.uniqueId ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {result.author.avatar ? (
                <img
                  src={result.author.avatar}
                  alt=""
                  className="h-6 w-6 rounded-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : null}
              <span>{dict.byAuthor}</span>
              <span className="font-medium text-foreground">@{result.author.uniqueId}</span>
            </div>
          ) : null}

          {result.title ? (
            <h3 className="line-clamp-3 text-pretty text-lg font-semibold leading-snug text-foreground">
              {result.title}
            </h3>
          ) : null}

          {(result.stats.views ?? result.stats.likes) !== null ? (
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {result.stats.views !== null ? (
                <li className="inline-flex items-center gap-1.5">
                  <EyeIcon size={14} aria-hidden />
                  {formatCount(result.stats.views, locale)}
                </li>
              ) : null}
              {result.stats.likes !== null ? (
                <li className="inline-flex items-center gap-1.5">
                  <FavouriteIcon size={14} aria-hidden />
                  {formatCount(result.stats.likes, locale)}
                </li>
              ) : null}
            </ul>
          ) : null}

          {!isSlideshow ? (
            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {hd ? (
                <DownloadButton option={hd} dict={dict} locale={locale} variant="primary" />
              ) : null}
              {sd ? (
                <DownloadButton option={sd} dict={dict} locale={locale} variant="outline" />
              ) : null}
              {result.audio ? (
                <DownloadButton
                  option={result.audio}
                  dict={dict}
                  locale={locale}
                  variant="outline"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {isSlideshow ? (
        <div className="mt-6">
          <p className="mb-3 text-sm text-muted-foreground">
            {dict.photoCount.replace("{count}", String(result.photos.length))}
          </p>

          {/*
           * Top-of-section actions: Download all + Save audio. The audio
           * button is intentionally up here, not after the photo grid, so
           * the user does not have to scroll past 20+ photos to find the
           * MP3 save.
           */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={zipping}
              className={cn(
                buttonVariants({ size: "md", variant: "primary" }),
                "justify-center",
              )}
            >
              <Download04Icon size={16} aria-hidden />
              {zipping ? dict.preparingZip : dict.downloadAll}
            </button>
            {result.audio ? (
              <DownloadButton
                option={result.audio}
                dict={dict}
                locale={locale}
                variant="outline"
              />
            ) : null}
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {result.photos.map((photo, i) => (
              <li
                key={photo}
                className="group relative overflow-hidden rounded-md border border-border bg-muted"
              >
                <img
                  src={photo}
                  alt=""
                  className="aspect-[3/4] w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <a
                  href={photoHref(photo, `tiktok-${result.id}-${i + 1}.jpg`)}
                  className={cn(
                    "absolute inset-x-2 bottom-2 flex items-center justify-center gap-2",
                    buttonVariants({ size: "sm", variant: "primary" }),
                  )}
                >
                  <Download04Icon size={14} aria-hidden />
                  {dict.downloadPhoto}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

interface DownloadButtonProps {
  option: DownloadOption;
  dict: Dictionary["result"];
  locale: string;
  variant: "primary" | "outline";
}

function DownloadButton({ option, dict, locale, variant }: DownloadButtonProps) {
  const label =
    option.kind === "video-hd"
      ? dict.downloadHd
      : option.kind === "video-sd"
        ? dict.downloadStandard
        : dict.downloadAudio;
  const Icon = option.kind === "audio" ? MusicNote01Icon : Download04Icon;
  const size = option.sizeBytes ? formatBytes(option.sizeBytes, locale) : "";

  return (
    <a
      href={downloadHref(option)}
      className={cn(buttonVariants({ size: "md", variant }), "justify-center sm:justify-start")}
    >
      <Icon size={18} aria-hidden />
      <span>{label}</span>
      {size ? <span className="text-xs opacity-80">· {size}</span> : null}
    </a>
  );
}

/**
 * Tiny icon export so the form can render an empty-state illustration
 * without pulling the whole result component into its bundle. Keeps the
 * "before fetch" and "after fetch" UI in separate code paths.
 */
export const SlideshowIcon = Image01Icon;
