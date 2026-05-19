import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'bd_admin';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Resolve the session secret per-call rather than at module load. In production
// we refuse to fall back to a default — a missing secret makes admin auth
// fail-closed (every isAuthed call returns false). In dev we allow a known-weak
// fallback so local work isn't blocked.
function sessionSecret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === 'production') return null;
  return 'change-me-in-production-DEV-ONLY';
}

function base64urlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

function sign(payload: string, secret: string): string {
  return base64urlEncode(createHmac('sha256', secret).update(payload).digest());
}

export async function setAdminCookie(): Promise<void> {
  const secret = sessionSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET not configured');
  const payload = base64urlEncode(Buffer.from(JSON.stringify({ iat: Date.now() })));
  const sig = sign(payload, secret);
  const jar = await cookies();
  jar.set(COOKIE_NAME, `${payload}.${sig}`, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function isAuthed(): Promise<boolean> {
  const secret = sessionSecret();
  if (!secret) return false;
  const jar = await cookies();
  const got = jar.get(COOKIE_NAME)?.value;
  if (!got) return false;
  const dot = got.indexOf('.');
  if (dot < 1 || dot === got.length - 1) return false;
  const payload = got.slice(0, dot);
  const sig = got.slice(dot + 1);
  const expected = sign(payload, secret);
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  let iat = 0;
  try {
    const parsed = JSON.parse(base64urlDecode(payload).toString('utf8'));
    iat = typeof parsed?.iat === 'number' ? parsed.iat : 0;
  } catch {
    return false;
  }
  const ageMs = Date.now() - iat;
  if (!Number.isFinite(ageMs) || ageMs < 0) return false;
  return ageMs <= MAX_AGE_SECONDS * 1000;
}
