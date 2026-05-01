import "server-only";

import type { Dictionary } from "@/types/dictionary";
import type { Locale } from "@/types/locale";

/**
 * Dynamic imports keyed by locale. Doing it this way means the bundler
 * code-splits each translation file, so a request for /fr only ships the
 * French JSON, not all ten dictionaries at once.
 */
const loaders: Record<Locale, () => Promise<{ default: Dictionary }>> = {
  en: () => import("./dictionaries/en.json") as Promise<{ default: Dictionary }>,
  es: () => import("./dictionaries/es.json") as Promise<{ default: Dictionary }>,
  fr: () => import("./dictionaries/fr.json") as Promise<{ default: Dictionary }>,
  de: () => import("./dictionaries/de.json") as Promise<{ default: Dictionary }>,
  pt: () => import("./dictionaries/pt.json") as Promise<{ default: Dictionary }>,
  id: () => import("./dictionaries/id.json") as Promise<{ default: Dictionary }>,
  ja: () => import("./dictionaries/ja.json") as Promise<{ default: Dictionary }>,
  ko: () => import("./dictionaries/ko.json") as Promise<{ default: Dictionary }>,
  bn: () => import("./dictionaries/bn.json") as Promise<{ default: Dictionary }>,
  ar: () => import("./dictionaries/ar.json") as Promise<{ default: Dictionary }>,
};

/**
 * Load the dictionary for a given locale. Server-only — translations stay
 * out of the client bundle and ship as inert HTML text.
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = loaders[locale];
  const mod = await loader();
  return mod.default;
}
