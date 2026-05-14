/**
 * POST /api/booking/[token]/reschedule — visitor moves their slot. Validates
 * the new startUtc against the same rule/availability/lock that a fresh
 * booking would hit, updates Booking + writes BookingEvent('rescheduled'),
 * patches the GCal event if one exists, and re-sends a confirmation email
 * for the new time. The original tokenVersion stays the same so the token
 * remains valid (handy if the visitor reschedules twice).
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { rateLimit, clientIp } from '@/lib/security/ratelimit';
import { verifyManageToken } from '@/lib/booking/tokens';
import { getBookingRule } from '@/lib/booking/rules';
import { authedClient, getGoogleEnv } from '@/lib/booking/google';
import { google as googleApi } from 'googleapis';
import { notifyVisitorBookingConfirmed, notifyAdminOfBooking } from '@/lib/email/booking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({ startUtc: z.string().datetime() });

class SlotContestedError extends Error {}
class SlotTakenError extends Error {}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  const ip = clientIp(req);
  const limit = rateLimit(`reschedule:${ip}`, { max: 10, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'too many requests' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const { token } = await ctx.params;
  const decoded = verifyManageToken(token);
  if (!decoded) return NextResponse.json({ error: 'invalid or expired' }, { status: 404 });

  const raw = await req.json().catch(() => null);
  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }

  const newStartMs = Date.parse(parsed.data.startUtc);
  if (!Number.isFinite(newStartMs)) {
    return NextResponse.json({ error: 'invalid startUtc' }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: decoded.bookingId } });
  if (!booking) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (booking.tokenVersion !== decoded.tokenVersion) {
    return NextResponse.json({ error: 'token superseded' }, { status: 410 });
  }
  if (booking.status === 'CANCELLED') {
    return NextResponse.json({ error: 'already cancelled' }, { status: 409 });
  }

  const rule = await getBookingRule();
  const newEndMs = newStartMs + rule.durationMin * 60_000;
  const bufferMs = rule.bufferMin * 60_000;

  if (newStartMs < Date.now() + rule.minNoticeMin * 60_000) {
    return NextResponse.json({ error: 'slot too soon' }, { status: 409 });
  }

  const slotKey = Math.floor(newStartMs / 60_000);

  try {
    await prisma.$transaction(async (tx) => {
      const lockRows = await tx.$queryRaw<{ locked: boolean }[]>`
        SELECT pg_try_advisory_xact_lock(${BigInt(slotKey)}::bigint) AS locked
      `;
      if (lockRows[0]?.locked !== true) throw new SlotContestedError();

      const startUtc = new Date(newStartMs);
      const endUtc = new Date(newEndMs);

      const conflict = await tx.booking.findFirst({
        where: {
          id: { not: booking.id },
          status: { in: ['CONFIRMED', 'RESCHEDULED'] },
          AND: [
            { startUtc: { lt: new Date(newEndMs + bufferMs) } },
            { endUtc: { gt: new Date(newStartMs - bufferMs) } },
          ],
        },
        select: { id: true },
      });
      if (conflict) throw new SlotTakenError();

      await tx.booking.update({
        where: { id: booking.id },
        data: { startUtc, endUtc, status: 'RESCHEDULED', reminder24Sent: null },
      });
      await tx.bookingEvent.create({
        data: {
          bookingId: booking.id,
          type: 'rescheduled',
          payload: {
            from: {
              startUtc: booking.startUtc.toISOString(),
              endUtc: booking.endUtc.toISOString(),
            },
            to: { startUtc: startUtc.toISOString(), endUtc: endUtc.toISOString() },
            actor: 'visitor',
          },
        },
      });
    });
  } catch (err) {
    if (err instanceof SlotContestedError || err instanceof SlotTakenError) {
      return NextResponse.json({ error: 'slot just taken', code: 'slot_taken' }, { status: 409 });
    }
    console.error('[/api/booking/reschedule]', err);
    return NextResponse.json({ error: 'persistence failed' }, { status: 500 });
  }

  // Patch the GCal event if one exists. Best-effort.
  const updated = await prisma.booking.findUnique({ where: { id: booking.id } });
  if (!updated) {
    return NextResponse.json({ error: 'missing after update' }, { status: 500 });
  }
  if (updated.gcalEventId) {
    try {
      const env = getGoogleEnv();
      if (env) {
        const token = await prisma.googleToken.findUnique({ where: { id: 'singleton' } });
        if (token) {
          const client = authedClient(env, token);
          const calendar = googleApi.calendar({ version: 'v3', auth: client });
          await calendar.events.patch({
            calendarId: env.ownerCalendarId,
            eventId: updated.gcalEventId,
            sendUpdates: 'all',
            requestBody: {
              start: { dateTime: updated.startUtc.toISOString(), timeZone: 'UTC' },
              end: { dateTime: updated.endUtc.toISOString(), timeZone: 'UTC' },
            },
          });
        }
      }
    } catch (err) {
      console.error('[/api/booking/reschedule] gcal patch failed (continuing)', err);
    }
  }

  // Email both sides about the new time.
  const payload = {
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
    meetUrl: updated.meetUrl,
    tokenVersion: updated.tokenVersion,
    skipIcs: !!updated.meetUrl && !!updated.gcalEventId, // Google's patch already sent an update invite
  };
  notifyVisitorBookingConfirmed(payload).catch((err) =>
    console.error('[/api/booking/reschedule] visitor email failed', err),
  );
  notifyAdminOfBooking(payload).catch((err) =>
    console.error('[/api/booking/reschedule] admin email failed', err),
  );

  return NextResponse.json({ ok: true, bookingId: updated.id });
}
