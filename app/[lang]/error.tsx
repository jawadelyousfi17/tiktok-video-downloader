"use client";

import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Locale-scoped error boundary. Kept locale-agnostic for now (no dictionary
 * access) so a translation load failure cannot itself crash the boundary.
 */
export default function LocaleError({ error, reset }: ErrorProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong.</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || "Please try again. If it keeps happening, refresh the page."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
