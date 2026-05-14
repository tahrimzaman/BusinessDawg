import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { rateLimit, clientIp } from '@/lib/security/ratelimit';
import { isLikelyBot, HONEYPOT_FIELD, TIMESTAMP_FIELD } from '@/lib/security/honeypot';
import { hashIp } from '@/lib/security/hash';
import { notifyAdminOfSubscriber } from '@/lib/email/send';

export const runtime = 'nodejs';

const Schema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  source: z.string().trim().max(40).optional(),
  [HONEYPOT_FIELD]: z.string().optional(),
  [TIMESTAMP_FIELD]: z.union([z.number(), z.string()]).optional(),
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  if (!raw) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const ip = clientIp(req);
  const limit = rateLimit(`newsletter:${ip}`, { max: 5, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'too many requests' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 });
  }

  if (isLikelyBot(parsed.data)) {
    return NextResponse.json({ ok: true });
  }

  const { email, source } = parsed.data;
  const userAgent = req.headers.get('user-agent')?.slice(0, 500) || null;

  try {
    await prisma.subscriber.create({
      data: {
        email,
        source: source || 'newsletter',
        ipHash: hashIp(ip),
        userAgent,
      },
    });
  } catch (err) {
    // P2002 = unique constraint on email. Treat as success — the user is already in.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ ok: true, deduped: true });
    }
    console.error('[/api/newsletter] db error', err);
    return NextResponse.json({ error: 'persistence failed' }, { status: 500 });
  }

  notifyAdminOfSubscriber({ email, source: source || 'newsletter' }).catch((err) =>
    console.error('[/api/newsletter] email error', err),
  );

  return NextResponse.json({ ok: true });
}
