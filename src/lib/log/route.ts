/**
 * `withLogging` — wrap an App Router route handler so every request emits a
 * single structured JSON line on completion (or unhandled throw).
 *
 *     export const POST = withLogging('booking.create', async (req) => { ... });
 *
 * What gets logged:
 *   - `requestId` — pulled from the `x-request-id` header (set by middleware)
 *     or freshly generated.
 *   - `route` — the human-readable name you pass in. NOT the URL — the URL
 *     can contain PII (booking tokens, customer IDs). Names like
 *     `booking.create`, `admin.customers.update` are what you grep for.
 *   - `method`, `status`, `durationMs`.
 *   - `error` (message + class) on unhandled throws. We re-throw so Next's
 *     default error handling still runs — we just steal a log line on the
 *     way through.
 *
 * The wrapper also writes `x-request-id` back on the response so clients /
 * curl can echo it when reporting bugs.
 *
 * Why a wrapper instead of middleware: middleware in App Router doesn't see
 * the response status or duration cleanly — it sees the request go in and
 * comes back via headers only. A wrapper is the smallest thing that captures
 * both ends.
 */

import * as Sentry from '@sentry/nextjs';
import { log, withRequest, type LogContext } from './logger';

type Handler<TCtx> = (req: Request, ctx: TCtx) => Promise<Response> | Response;

export function withLogging<TCtx>(routeName: string, handler: Handler<TCtx>): Handler<TCtx> {
  return async (req: Request, ctx: TCtx) => {
    const start = Date.now();
    const { requestId, log: rlog } = withRequest(req);
    const base: LogContext = { route: routeName, method: req.method };
    try {
      const res = await handler(req, ctx);
      const durationMs = Date.now() - start;
      // Mirror request-id back so callers can correlate.
      try {
        res.headers.set('x-request-id', requestId);
      } catch {
        // Some Response objects (e.g. NextResponse.redirect) have immutable
        // headers — silently skip; the log still ties to the request.
      }
      rlog(res.status >= 500 ? 'error' : 'info', 'request', {
        ...base,
        status: res.status,
        durationMs,
      });
      return res;
    } catch (err) {
      const durationMs = Date.now() - start;
      const error = err as Error;
      log('error', 'unhandled', {
        requestId,
        ...base,
        durationMs,
        errorMessage: error?.message ?? String(err),
        errorName: error?.name ?? 'Error',
      });
      // Report to Sentry tagged with the route name + request id so we can
      // jump from a Sentry issue back to the corresponding structured log
      // line in Hostinger. No-op when SENTRY_DSN isn't set.
      Sentry.captureException(err, {
        tags: { route: routeName, requestId },
        contexts: { request: { method: req.method, durationMs } },
      });
      throw err;
    }
  };
}
