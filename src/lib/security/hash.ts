import { createHmac } from 'node:crypto';

/**
 * One-way HMAC of an IP — same shape as before (16 hex chars), keyed.
 *
 * Why HMAC instead of plain SHA-256: with ~4B IPv4 addresses, a plain
 * truncated-SHA hash is trivially rainbow-tableable. HMAC with a server-side
 * secret makes that attack require the secret, which never leaves the server.
 *
 * Existing rows in the DB are unsalted-SHA hashes; new rows are HMACs. The
 * column was named `ipHash` in the schema and we keep that name (renaming
 * cascades across Subscriber / Application / Booking and is more painful
 * than the cohort split is worth). The two cohorts won't dedupe against each
 * other, which is fine — abuse-dedupe is a forward-looking concern and old
 * rows aren't competing for the same slot.
 */
export function hashIp(ip: string): string {
  const secret = process.env.IP_HASH_SALT;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      // Fail-loud: returning an empty string would silently break abuse-dedup
      // and could create a unique constraint collision in some future schema.
      throw new Error('IP_HASH_SALT must be set in production');
    }
    // Dev: use a known-weak fallback so local work isn't blocked. NEVER ship
    // this to a deployed env.
    return createHmac('sha256', 'dev-only-unsafe-salt').update(ip).digest('hex').slice(0, 16);
  }
  return createHmac('sha256', secret).update(ip).digest('hex').slice(0, 16);
}
