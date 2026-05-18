/**
 * Next.js instrumentation hook — runs once on server boot for both the Node
 * and Edge runtimes. Used to register Sentry SDK init for whichever runtime
 * is starting. Browser-side init lives in `instrumentation-client.ts`.
 *
 * No-ops gracefully when SENTRY_DSN is absent (dev environments, PRs where
 * Tahrim hasn't pasted the DSN yet) — Sentry.init with an empty DSN is a
 * cheap noop, no errors emitted, no network calls made.
 */
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Capture errors thrown inside React Server Components / route handlers so
// they show up grouped in Sentry with full request context (URL, headers,
// search params). Without this, RSC errors fall to Next's default page and
// don't reach Sentry.
export const onRequestError = Sentry.captureRequestError;
