/**
 * Quiet loading state. Shown for the brief moment between navigation and
 * the next dictionary load — no spinner, just a faded version of the
 * layout shell so the page does not flash.
 */
export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      <div className="mt-6 h-14 w-full max-w-2xl animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
