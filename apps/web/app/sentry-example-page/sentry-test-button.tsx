'use client';

/** Fires the exact undefined-function error requested for Sentry verification. */
export function SentryTestButton() {
  return (
    <button
      type="button"
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-burgundy px-6 font-semibold text-white transition hover:bg-burgundyAccent focus:outline-none focus:ring-2 focus:ring-burgundyAccent focus:ring-offset-2 focus:ring-offset-ink"
      onClick={() => {
        // @ts-expect-error Intentionally undefined for Sentry smoke testing.
        myUndefinedFunction();
      }}
    >
      Trigger Sentry Test Error
    </button>
  );
}
