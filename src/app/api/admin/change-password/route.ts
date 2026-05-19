import { NextResponse } from 'next/server';
import { z } from 'zod';
import { setAdminCookie } from '@/lib/admin/auth';
import { updatePassword, verifyCredentials } from '@/lib/admin/credentials';
import { prisma } from '@/lib/db/prisma';
import { rateLimit, rateLimitKey, clientIp } from '@/lib/security/ratelimit';
import { hashIp } from '@/lib/security/hash';
import { capture } from '@/lib/analytics/posthog-server';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';

const Payload = z.object({
  currentPassword: z.string().min(1).max(256),
  newPassword: z.string().min(8).max(256),
});

async function audit(
  req: Request,
  ip: string,
  action: 'password_change_success' | 'password_change_failure' | 'password_change_rate_limited',
): Promise<void> {
  const userAgent = req.headers.get('user-agent')?.slice(0, 500) || null;
  try {
    await prisma.adminAudit.create({
      data: { action, actorIpHash: hashIp(ip), userAgent },
    });
  } catch {
    /* swallow */
  }
  capture(action, hashIp(ip), { userAgent });
}

async function handlePOST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(rateLimitKey('admin-change-pw', ip), { max: 10, windowMs: 5 * 60_000 });
  if (!limit.ok) {
    await audit(req, ip, 'password_change_rate_limited');
    return NextResponse.json({ error: 'too many attempts' }, { status: 429 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = Payload.safeParse(raw);
  if (!parsed.success) {
    await audit(req, ip, 'password_change_failure');
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }

  // We need the admin's email to re-verify the current password. Pull it from
  // the single-row credential table.
  const row = await prisma.adminCredential.findUnique({ where: { id: 1 } });
  if (!row) {
    await audit(req, ip, 'password_change_failure');
    return NextResponse.json({ error: 'not initialized' }, { status: 400 });
  }
  const ok = await verifyCredentials(row.email, parsed.data.currentPassword);
  if (!ok) {
    await audit(req, ip, 'password_change_failure');
    return NextResponse.json({ error: 'current password is wrong' }, { status: 401 });
  }

  await updatePassword(parsed.data.newPassword);
  await setAdminCookie();
  await audit(req, ip, 'password_change_success');
  return NextResponse.json({ ok: true });
}

export const POST = withLogging('admin.change-password', handlePOST);
