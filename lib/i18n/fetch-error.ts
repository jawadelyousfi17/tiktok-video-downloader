import type { Dictionary } from "@/types/dictionary";
import type { FetchErrorCode } from "@/types/api";

/**
 * Turn a machine code from /api/fetch into copy in the visitor's language.
 *
 * The translation happens here, in the browser, rather than on the server:
 * that's the whole reason the landing pages can be prerendered. The route
 * answers every locale with the same JSON, and this function picks the
 * right sentence from the dictionary the page already shipped with.
 */
export function fetchErrorMessage(
  code: FetchErrorCode,
  formDict: Dictionary["hero"]["form"],
): string {
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
