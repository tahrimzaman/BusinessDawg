import { createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'bd_admin';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'change-me-in-production';

function expectedToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash('sha256').update(`${pw}:${SESSION_SECRET}`).digest('hex');
}

export async function setAdminCookie(): Promise<void> {
  const token = expectedToken();
  if (!token) throw new Error('ADMIN_PASSWORD not configured');
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // Broad enough to cover both /admin pages AND /api/admin/* endpoints
    // (e.g. CSV export). Without this, the export link 401s.
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
  if (!pw) return false;
  const a = Buffer.from(submitted);
  const b = Buffer.from(pw);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
