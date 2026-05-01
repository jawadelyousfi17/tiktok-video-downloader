/**
 * Format a byte count as a short, locale-friendly string. Falls back to the
 * raw byte value when Intl can't help. Used in download buttons next to the
 * label so users know roughly how big the file is before they click.
 */
export function formatBytes(bytes: number, locale: string): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: value >= 100 || unit === 0 ? 0 : 1,
  }).format(value);
  return `${formatted} ${units[unit]}`;
}

/**
 * Format a play / like / comment count as "1.2M", "12K". Big numbers come
 * back from TikTok in the millions and the literal value is hard to scan.
 */
export function formatCount(count: number, locale: string): string {
  if (!Number.isFinite(count) || count < 0) return "0";
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count);
}
