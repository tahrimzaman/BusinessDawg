import { NextResponse } from 'next/server';
import { setAdminCookie, verifyPassword } from '@/lib/admin/auth';
import { rateLimit, clientIp } from '@/lib/security/ratelimit';
import { hashIp } from '@/lib/security/hash';
import { prisma } from '@/lib/db/prisma';
import { capture } from '@/lib/analytics/posthog-server';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';

async function recordAttempt(
  req: Request,
  ip: string,
  action: 'login_success' | 'login_failure' | 'login_rate_limited',
): Promise<void> {
  const userAgent = req.headers.get('user-agent')?.slice(0, 500) || null;
  try {
    await prisma.adminAudit.create({
      data: {
        action,
        actorIpHash: hashIp(ip),
        userAgent,
      },
    });
  } catch {
    // If the audit table write fails (DB down, schema drift), don't break
    // login itself — we'd rather Tahrim get in than the site lock down.
  }
  capture(action, hashIp(ip), { userAgent });
}

async function handlePOST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`admin-login:${ip}`, { max: 10, windowMs: 5 * 60_000 });
  if (!limit.ok) {
    await recordAttempt(req, ip, 'login_rate_limited');
    return NextResponse.json({ error: 'too many attempts' }, { status: 429 });
  }

  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !verifyPassword(password)) {
    await recordAttempt(req, ip, 'login_failure');
    return NextResponse.json({ error: 'invalid password' }, { status: 401 });
  }

  await setAdminCookie();
  await recordAttempt(req, ip, 'login_success');
  return NextResponse.json({ ok: true });
}

export const POST = withLogging('admin.login', handlePOST);
