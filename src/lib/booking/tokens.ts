/**
 * HMAC-signed booking management tokens. One token per booking handles both
 * reschedule and cancel — discriminated by which endpoint receives it.
 * Tokens are signed with ADMIN_SESSION_SECRET (which we already have set
 * for the /admin cookie); no extra env var needed.
 *
 * Payload: `${bookingId}.${tokenVersion}.${expSec}` — base64url-encoded,
 * followed by `.${signatureBase64url}`. Stateless: no DB lookup needed,
 * just constant-time verify. Cancelling bumps Booking.tokenVersion which
 * invalidates outstanding links.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

const SEPARATOR = '.';

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_SESSION_SECRET not configured');
  }
  return 'change-me-in-production-DEV-ONLY';
}

function b64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? 0 : 4 - (input.length % 4);
  const padded = input + '='.repeat(pad);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function sign(payload: string): string {
  return b64url(createHmac('sha256', secret()).update(payload).digest());
}

export type ManageToken = {
  bookingId: string;
  tokenVersion: number;
  expSec: number; // unix seconds
};

/**
 * Build a token that expires 1h after `endUtc` (further reschedule/cancel after
 * the call ends + grace window is meaningless and could leak intent if the link
 * is forwarded long after). Returns base64url-encoded `${payload}.${sig}`.
 */
export function signManageToken(args: {
  bookingId: string;
  tokenVersion: number;
  endUtc: Date;
}): string {
  const expSec = Math.floor(args.endUtc.getTime() / 1000) + 3600;
  const payload = b64url(`${args.bookingId}${SEPARATOR}${args.tokenVersion}${SEPARATOR}${expSec}`);
  const sig = sign(payload);
  return `${payload}${SEPARATOR}${sig}`;
}

/**
 * Verify and decode a manage token. Returns the payload on success, or null
 * on any failure (bad signature, malformed, expired). Caller still needs to
 * load the booking and check `tokenVersion` matches the current DB value.
 */
export function verifyManageToken(token: string): ManageToken | null {
  const parts = token.split(SEPARATOR);
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  if (!payload || !sig) return null;
  const expected = sign(payload);
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  let decoded: string;
  try {
    decoded = b64urlDecode(payload).toString('utf8');
  } catch {
    return null;
  }
  const segs = decoded.split(SEPARATOR);
  if (segs.length !== 3) return null;
  const bookingId = segs[0];
  const tokenVersion = Number(segs[1]);
  const expSec = Number(segs[2]);
  if (!bookingId || !Number.isFinite(tokenVersion) || !Number.isFinite(expSec)) return null;
  if (expSec * 1000 < Date.now()) return null;
  return { bookingId, tokenVersion, expSec };
}
