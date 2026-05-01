import { ResultLoader } from "@/components/result-loader";

/**
 * Soft-navigation loading state. Renders inside the locale layout, so
 * the SiteHeader and SiteFooter stay visible — only the page body
 * swaps to the branded loader.
 */
export default function Loading() {
  return <ResultLoader />;
}
