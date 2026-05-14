import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { rateLimit, clientIp } from '@/lib/security/ratelimit';
import { isLikelyBot, HONEYPOT_FIELD, TIMESTAMP_FIELD } from '@/lib/security/honeypot';
import { hashIp } from '@/lib/security/hash';
import { notifyAdminOfApplication } from '@/lib/email/send';

export const runtime = 'nodejs';

const Schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  role: z.string().trim().max(80).optional().or(z.literal('')),
  portfolio: z.string().trim().url().max(500).optional().or(z.literal('')),
  note: z.string().trim().max(2000).optional().or(z.literal('')),
  [HONEYPOT_FIELD]: z.string().optional(),
  [TIMESTAMP_FIELD]: z.union([z.number(), z.string()]).optional(),
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  if (!raw) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const ip = clientIp(req);
  const limit = rateLimit(`join:${ip}`, { max: 5, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'too many requests' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    // Don't leak the Zod schema in the response — generic message only. The
    // frontend already enforces field constraints client-side, so a 400 here
    // is either a misconfigured client or a probe.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[/api/join] validation failed', parsed.error.issues);
    }
    return NextResponse.json({ error: 'invalid fields' }, { status: 400 });
  }

  if (isLikelyBot(parsed.data)) {
    // Silent accept — don't tip off the bot.
    return NextResponse.json({ ok: true });
  }

  const { name, email, role, portfolio, note } = parsed.data;
  const userAgent = req.headers.get('user-agent')?.slice(0, 500) || null;

  try {
    await prisma.application.create({
      data: {
        name,
        email,
        role: role || null,
        portfolio: portfolio || null,
        note: note || null,
        ipHash: hashIp(ip),
        userAgent,
      },
    });
  } catch (err) {
    console.error('[/api/join] db error', err);
    return NextResponse.json({ error: 'persistence failed' }, { status: 500 });
  }

  // Fire-and-forget email — don't block the response on email delivery.
  notifyAdminOfApplication({ name, email, role, portfolio, note }).catch((err) =>
    console.error('[/api/join] email error', err),
  );

  return NextResponse.json({ ok: true });
}
