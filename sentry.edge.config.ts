/**
 * Sentry init for the Edge runtime — middleware.ts and any route handler that
 * opts into `export const runtime = 'edge'`. Currently none of our routes do
 * (everything is nodejs for Prisma compat) but middleware runs here, so we
 * register Sentry to catch middleware exceptions.
 */
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || undefined,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  });
}
