import type { Locale, LocaleMeta } from "@/types/locale";

export const defaultLocale: Locale = "en";

/**
 * Order matters: this is the order locales appear in the language switcher.
 * Native names are intentionally written by speakers, not transliterated.
 */
export const locales: readonly LocaleMeta[] = [
  { code: "en", nativeName: "English", englishName: "English", dir: "ltr", htmlLang: "en", flag: "🇺🇸" },
  { code: "es", nativeName: "Español", englishName: "Spanish", dir: "ltr", htmlLang: "es", flag: "🇪🇸" },
  { code: "fr", nativeName: "Français", englishName: "French", dir: "ltr", htmlLang: "fr", flag: "🇫🇷" },
  { code: "de", nativeName: "Deutsch", englishName: "German", dir: "ltr", htmlLang: "de", flag: "🇩🇪" },
  { code: "pt", nativeName: "Português", englishName: "Portuguese", dir: "ltr", htmlLang: "pt", flag: "🇧🇷" },
  { code: "id", nativeName: "Bahasa Indonesia", englishName: "Indonesian", dir: "ltr", htmlLang: "id", flag: "🇮🇩" },
  { code: "ja", nativeName: "日本語", englishName: "Japanese", dir: "ltr", htmlLang: "ja", flag: "🇯🇵" },
  { code: "ko", nativeName: "한국어", englishName: "Korean", dir: "ltr", htmlLang: "ko", flag: "🇰🇷" },
  { code: "bn", nativeName: "বাংলা", englishName: "Bengali", dir: "ltr", htmlLang: "bn", flag: "🇧🇩" },
  { code: "ar", nativeName: "العربية", englishName: "Arabic", dir: "rtl", htmlLang: "ar", flag: "🇸🇦" },
] as const;

export const localeCodes = locales.map((l) => l.code) as Locale[];

/**
 * Type guard for narrowing arbitrary strings (e.g. URL params) to a supported Locale.
 * Used so a missing or unknown lang segment renders a 404 instead of a runtime crash.
 */
export function isLocale(value: string): value is Locale {
  return (localeCodes as string[]).includes(value);
}

export function getLocaleMeta(code: Locale): LocaleMeta {
  const meta = locales.find((l) => l.code === code);
  if (!meta) throw new Error(`Unknown locale: ${code}`);
  return meta;
}

/**
 * Build the public URL path for a locale. Default locale lives at the root,
 * everything else lives under /<code>. Used by metadata alternates and the
 * language switcher.
 */
export function localePath(code: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (code === defaultLocale) return clean;
  return clean === "/" ? `/${code}` : `/${code}${clean}`;
}
