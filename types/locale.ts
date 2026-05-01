/**
 * Locale codes used as URL prefixes (except for the default locale, which lives at the root).
 */
export type Locale =
  | "en"
  | "es"
  | "ar"
  | "fr"
  | "bn"
  | "id"
  | "pt"
  | "de"
  | "ja"
  | "ko";

export interface LocaleMeta {
  code: Locale;
  /** Native name used inside the language switcher. */
  nativeName: string;
  /** English-facing label. */
  englishName: string;
  /** Text direction. Only Arabic is RTL in the supported set. */
  dir: "ltr" | "rtl";
  /** BCP-47 tag used in <html lang> and hreflang alternates. */
  htmlLang: string;
  /**
   * Flag emoji shown in the language switcher. Languages span multiple
   * countries (English, Portuguese, Arabic, Bengali) so we pick the most
   * common online market: US for English, Brazil for Portuguese, Saudi
   * Arabia for Arabic, Bangladesh for Bengali.
   */
  flag: string;
}
