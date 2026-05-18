/**
 * Browser-side Sentry init. Next 16 loads this file automatically on the
 * client before any app code runs, in parallel with React hydration. Catches
 * client-side unhandled errors, React render errors caught by error
 * boundaries, and promise rejections.
 *
 * We deliberately skip Session Replay — it's expensive on the free tier and
 * the bigger value for a marketing site is the error tracking, not session
 * recordings. Can be added later if Tahrim wants visual repro of bugs.
 */
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || undefined,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    // No session replay; see file header.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    integrations: [],
    // Skip noisy errors that are well-known browser quirks rather than real
    // bugs — extension scripts, ResizeObserver loops, AbortError on nav.
    ignoreErrors: [
      'ResizeObserver loop completed with undelivered notifications',
      'ResizeObserver loop limit exceeded',
      'AbortError',
      // Browser extension errors — not ours.
      /^Script error\.?$/,
      /chrome-extension:/,
      /moz-extension:/,
    ],
  });
}

// Required for Next 16's instrumentation-client contract — exported hook that
// Sentry uses to capture client-side navigation transitions for tracing.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
