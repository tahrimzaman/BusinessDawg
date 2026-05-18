import { createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'bd_admin';

// Resolve the session secret per-call rather than at module load. In production
// we refuse to fall back to a default — a missing secret makes admin auth
// fail-closed (every isAuthed/verifyPassword returns false). In dev we allow a
// known-weak fallback so local work isn't blocked.
function sessionSecret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === 'production') return null;
  return 'change-me-in-production-DEV-ONLY';
}

function expectedToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  const secret = sessionSecret();
  if (!pw || !secret) return null;
  return createHash('sha256').update(`${pw}:${secret}`).digest('hex');
}

export async function setAdminCookie(): Promise<void> {
  const token = expectedToken();
  if (!token) throw new Error('ADMIN_PASSWORD not configured');
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    // Always secure. Browsers tolerate Secure on localhost, so this is safe
    // for local dev too and prevents any chance of the cookie crossing an
    // unencrypted link on a LAN-tested mobile device.
    secure: true,
    // 'strict' instead of 'lax' — there is no inbound cross-site flow we
    // need to preserve for /admin. This blocks the entire CSRF surface.
    sameSite: 'strict',
    // Broad enough to cover both /admin pages AND /api/admin/* endpoints
    // (e.g. CSV export). Without this, the export link 401s. A future refactor
    // can split the prefix and tighten this to /admin.
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function isAuthed(): Promise<boolean> {
  const expected = expectedToken();
  if (!expected) return false;
  const jar = await cookies();
  const got = jar.get(COOKIE_NAME)?.value;
  if (!got) return false;
  try {
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(got, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyPassword(submitted: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  // Also require a session secret to be configured in production — otherwise
  // the cookie we set wouldn't validate on subsequent requests.
  if (!pw || sessionSecret() === null) return false;
  const a = Buffer.from(submitted);
  const b = Buffer.from(pw);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
