import { NextResponse } from 'next/server';
import { setAdminCookie, verifyPassword } from '@/lib/admin/auth';
import { rateLimit, clientIp } from '@/lib/security/ratelimit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`admin-login:${ip}`, { max: 10, windowMs: 5 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json({ error: 'too many attempts' }, { status: 429 });
  }

  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !verifyPassword(password)) {
    return NextResponse.json({ error: 'invalid password' }, { status: 401 });
  }

  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
