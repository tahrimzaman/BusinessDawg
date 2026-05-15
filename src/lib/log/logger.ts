/**
 * Structured JSON logger.
 *
 * Why bother: Hostinger streams every console.* line into a flat log file.
 * "Error sending email: ECONNRESET" is fine to read; it's hopeless to grep
 * when you're tracing one visitor's booking-flow path across 4 separate API
 * calls. JSON lines with a shared `requestId` make that trivial:
 *
 *     grep '"requestId":"abc123"' /home/user/logs/businessdawg.log
 *
 * Every line is one object on one line — that's `bunyan`-style and it's
 * what most log shippers (Datadog, Logtail, Better Stack) expect by default.
 *
 * No external deps. No log levels-as-config — `info` and below go to stdout,
 * `error` to stderr, which is the Unix convention Hostinger's logger already
 * splits on.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogContext = Record<string, unknown>;

export function log(level: LogLevel, msg: string, ctx: LogContext = {}): void {
  // Strip undefined values so they don't serialize as `null`. JSON.stringify
  // skips undefined naturally — this is just for clarity in the output.
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg,
    ...ctx,
  });
  if (level === 'error') {
    console.error(line);
  } else {
    console.log(line);
  }
}

/**
 * Build a per-request logger that auto-injects requestId into every line.
 *
 * Reads `x-request-id` if the middleware set one; otherwise generates a fresh
 * UUID. Callers don't need to know which case applies.
 */
export function withRequest(req: Request): {
  requestId: string;
  log: (level: LogLevel, msg: string, ctx?: LogContext) => void;
} {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  return {
    requestId,
    log: (level: LogLevel, msg: string, ctx?: LogContext) => log(level, msg, { requestId, ...ctx }),
  };
}
