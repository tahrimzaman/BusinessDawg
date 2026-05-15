/**
 * POST /api/booking/hold — claim a 5-min soft hold on a slot while the
 * visitor fills the form. The hold blocks other visitors from picking the
 * same time and is automatically gone after 5 min (cleaned up lazily by
 * the availability query + a future cron). DELETE /api/booking/hold/[id]
 * releases it explicitly on form unmount / back / timeout.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { rateLimit, clientIp } from '@/lib/security/ratelimit';
import { getBookingRule } from '@/lib/booking/rules';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';

const Schema = z.object({
  startUtc: z.string().datetime(),
});

const HOLD_TTL_MS = 5 * 60_000;

async function handlePOST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`hold:${ip}`, { max: 20, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'too many requests' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const raw = await req.json().catch(() => null);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }

  const startMs = Date.parse(parsed.data.startUtc);
  if (!Number.isFinite(startMs)) {
    return NextResponse.json({ error: 'invalid startUtc' }, { status: 400 });
  }

  const rule = await getBookingRule();
  const endMs = startMs + rule.durationMin * 60_000;
  const expiresAt = new Date(Date.now() + HOLD_TTL_MS);

  const hold = await prisma.slotHold.create({
    data: {
      startUtc: new Date(startMs),
      endUtc: new Date(endMs),
      expiresAt,
    },
  });

  return NextResponse.json({ holdId: hold.id, expiresAt: expiresAt.toISOString() });
}

export const POST = withLogging('booking.hold.create', handlePOST);
