/**
 * Sentry init for the Node runtime — booking, chat, lead, newsletter, cron,
 * and all `/api/*` handlers. Loaded lazily by `instrumentation.ts` so it only
 * fires when Next is starting in Node mode (not Edge, not browser).
 *
 * Tracing is sampled at 10% in production (enough to catch slow routes
 * without burning the 10K performance-units/month free tier on a busy day).
 */
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    // Tag every event with the deploy SHA so we can correlate to a specific
    // commit. Falls back to "unknown" in local dev.
    release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || undefined,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    // Bone-stock breadcrumbs; we don't yet have anything custom worth wiring.
    integrations: [],
    beforeSend(event) {
      // Strip the request body from breadcrumbs/events — booking and chat
      // payloads contain visitor PII (name, email, intent) that we'd rather
      // not ship to a third party. We get URL + method + status which is
      // enough to triage 95% of issues.
      if (event.request) {
        delete event.request.data;
        delete event.request.cookies;
      }
      return event;
    },
  });
}
