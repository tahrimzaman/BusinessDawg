import { timingSafeEqual } from 'node:crypto';

/**
 * Shared Bearer-token check for cron endpoints.
 *
 * - Production: require Authorization: Bearer ${CRON_SECRET}. Constant-time
 *   compare so an attacker can't time-leak the secret byte-by-byte.
 * - Dev (no CRON_SECRET set): allow only when the request looks like it came
 *   from localhost. Lets local curl work without setting an env var, but a
 *   reverse-tunneled prod-like environment without the secret still 401s.
 *
 * Caller is responsible for the module-load `throw` that fails the deploy
 * when CRON_SECRET is missing in production.
 */
export function isCronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') return false;
    // Dev only: localhost / loopback callers pass without a secret.
    const host = (req.headers.get('host') || '').toLowerCase();
    return host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('[::1]');
  }
  const header = req.headers.get('authorization');
  if (!header) return false;
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
