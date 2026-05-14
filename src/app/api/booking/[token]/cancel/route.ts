/**
 * POST /api/booking/[token]/cancel — visitor-initiated soft cancel. Sets
 * status=CANCELLED, bumps tokenVersion (kills any outstanding manage links),
 * writes BookingEvent('cancelled'), tears down the GCal event if any, and
 * emails the visitor a confirmation of the cancellation.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { rateLimit, clientIp } from '@/lib/security/ratelimit';
import { verifyManageToken } from '@/lib/booking/tokens';
import { getBookingRule } from '@/lib/booking/rules';
import { authedClient, cancelBookingEvent, getGoogleEnv } from '@/lib/booking/google';
import { notifyVisitorBookingCancelled } from '@/lib/email/booking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  ctx: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  const ip = clientIp(req);
  const limit = rateLimit(`cancel:${ip}`, { max: 10, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'too many requests' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const { token } = await ctx.params;
  const decoded = verifyManageToken(token);
  if (!decoded) return NextResponse.json({ error: 'invalid or expired' }, { status: 404 });

  const booking = await prisma.booking.findUnique({ where: { id: decoded.bookingId } });
  if (!booking) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (booking.tokenVersion !== decoded.tokenVersion) {
    return NextResponse.json({ error: 'token superseded' }, { status: 410 });
  }
  if (booking.status === 'CANCELLED') {
    return NextResponse.json({ ok: true, alreadyCancelled: true });
  }

  const rule = await getBookingRule();

  const [updated] = await prisma.$transaction([
    prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED', tokenVersion: { increment: 1 } },
    }),
    prisma.bookingEvent.create({
      data: {
        bookingId: booking.id,
        type: 'cancelled',
        payload: { actor: 'visitor', from: booking.status },
      },
    }),
  ]);

  // Tear down the GCal event if any. Best-effort.
  if (booking.gcalEventId) {
    try {
      const env = getGoogleEnv();
      if (env) {
        const token = await prisma.googleToken.findUnique({ where: { id: 'singleton' } });
        if (token) {
          const client = authedClient(env, token);
          await cancelBookingEvent(client, env, booking.gcalEventId);
        }
      }
    } catch (err) {
      console.error('[/api/booking/cancel] gcal delete failed (continuing)', err);
    }
  }

  notifyVisitorBookingCancelled({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    company: updated.company,
    role: updated.role,
    phone: updated.phone,
    intent: updated.intent,
    source: updated.source,
    startUtc: updated.startUtc,
    endUtc: updated.endUtc,
    visitorTz: updated.visitorTz,
    ownerTz: rule.ownerTz,
    meetingTitle: rule.meetingTitle,
  }).catch((err) => console.error('[/api/booking/cancel] email failed', err));

  return NextResponse.json({ ok: true });
}
