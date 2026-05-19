import { NextResponse } from 'next/server';
import { z } from 'zod';
import { setAdminCookie, verifyPassword } from '@/lib/admin/auth';
import { rateLimit, rateLimitKey, clientIp } from '@/lib/security/ratelimit';
import { hashIp } from '@/lib/security/hash';
import { prisma } from '@/lib/db/prisma';
import { capture } from '@/lib/analytics/posthog-server';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';

// Cap the submitted password length so a malicious POST can't make us run a
// timing-safe compare against a 10MB string. Real admin passwords fit well
// under 200 chars; anything bigger is abuse.
const LoginPayload = z.object({
  password: z.string().min(1).max(256),
});

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
  const limit = rateLimit(rateLimitKey('admin-login', ip), { max: 10, windowMs: 5 * 60_000 });
  if (!limit.ok) {
    await recordAttempt(req, ip, 'login_rate_limited');
    return NextResponse.json({ error: 'too many attempts' }, { status: 429 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = LoginPayload.safeParse(raw);
  if (!parsed.success) {
    await recordAttempt(req, ip, 'login_failure');
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }
  if (!verifyPassword(parsed.data.password)) {
    await recordAttempt(req, ip, 'login_failure');
    return NextResponse.json({ error: 'invalid password' }, { status: 401 });
  }

  await setAdminCookie();
  await recordAttempt(req, ip, 'login_success');
  return NextResponse.json({ ok: true });
}

export const POST = withLogging('admin.login', handlePOST);
