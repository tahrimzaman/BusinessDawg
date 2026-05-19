// In-memory sliding-window IP rate limiter.
//
// Hostinger runs a single Node instance per app, so in-memory is fine for v1.
// If we ever scale horizontally we swap this for Upstash Redis without changing
// the call sites.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

// Periodically purge expired buckets so the Map doesn't grow unbounded over
// weeks/months of traffic. We check at most once every 5 minutes and drop
// only buckets that have already expired.
const PRUNE_INTERVAL_MS = 5 * 60_000;
let _lastPruneAt = 0;
function maybePrune(now: number): void {
  if (now - _lastPruneAt < PRUNE_INTERVAL_MS) return;
  _lastPruneAt = now;
  for (const [k, b] of buckets) {
    if (b.resetAt < now) buckets.delete(k);
  }
}

export function rateLimit(
  key: string,
  opts?: { max?: number; windowMs?: number },
): RateLimitResult {
  const max = opts?.max ?? 5;
  const windowMs = opts?.windowMs ?? 60_000;
  const now = Date.now();
  maybePrune(now);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= max) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true };
}

// Best-effort client IP. Hostinger sits behind LiteSpeed which sets x-forwarded-for.
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

import { hashIp } from './hash';

/**
 * Canonical rate-limit key. Uses the hashed IP rather than the raw value so
 * an accidental log/Sentry breadcrumb capturing the key string can't leak the
 * visitor's IP. Inputs of `'unknown'` are passed through untouched so all
 * IP-less requests share a single bucket (the abuse case is the same).
 */
export function rateLimitKey(scope: string, ip: string): string {
  return `${scope}:${ip === 'unknown' ? 'unknown' : hashIp(ip)}`;
}
