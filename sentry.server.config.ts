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
      // Strip anything that can carry PII before the event leaves the box:
      //   - request.data: booking/chat/lead payloads (name, email, intent)
      //   - request.cookies: includes the admin session token
      //   - request.headers: cookie/authorization headers leak the same
      //   - query string on request.url: booking manage tokens, UTM-stuffed
      //     emails, etc. Pathname stays so we can still triage by route.
      if (event.request) {
        delete event.request.data;
        delete event.request.cookies;
        if (event.request.headers) {
          delete (event.request.headers as Record<string, unknown>)['cookie'];
          delete (event.request.headers as Record<string, unknown>)['Cookie'];
          delete (event.request.headers as Record<string, unknown>)['authorization'];
          delete (event.request.headers as Record<string, unknown>)['Authorization'];
        }
        if (event.request.url) {
          try {
            const u = new URL(event.request.url);
            event.request.url = `${u.origin}${u.pathname}`;
          } catch {
            /* malformed url — leave as-is */
          }
        }
      }
      return event;
    },
  });
}
