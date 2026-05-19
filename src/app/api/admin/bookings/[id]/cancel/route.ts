/**
 * POST /api/admin/bookings/[id]/cancel — soft cancel. Sets status=CANCELLED,
 * bumps tokenVersion (kills any outstanding visitor reschedule/cancel links),
 * writes BookingEvent('cancelled'), and fires the visitor cancellation email.
 * The row stays in the DB so the audit trail survives.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthed } from '@/lib/admin/auth';
import { getBookingRule } from '@/lib/booking/rules';
import { authedClient, cancelBookingEvent, getGoogleEnv } from '@/lib/booking/google';
import { loadGoogleToken } from '@/lib/booking/google-token';
import { notifyVisitorBookingCancelled } from '@/lib/email/booking';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handlePOST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (booking.status === 'CANCELLED') {
    return NextResponse.json({ ok: true, alreadyCancelled: true });
  }

  const rule = await getBookingRule();

  const [updated] = await prisma.$transaction([
    prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        tokenVersion: { increment: 1 },
      },
    }),
    prisma.bookingEvent.create({
      data: {
        bookingId: id,
        type: 'cancelled',
        payload: { actor: 'admin', from: booking.status },
      },
    }),
  ]);

  // Best-effort GCal event tear-down. Booking stays cancelled even if this fails.
  if (booking.gcalEventId) {
    try {
      const env = getGoogleEnv();
      if (env) {
        const token = await loadGoogleToken();
        if (token) {
          const client = authedClient(env, token);
          await cancelBookingEvent(client, env, booking.gcalEventId);
        }
      }
    } catch (err) {
      console.error('[/api/admin/bookings/cancel] gcal delete failed (continuing)', err);
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
  }).catch((err) => console.error('[/api/admin/bookings/cancel] email failed', err));

  return NextResponse.json({ ok: true });
}

export const POST = withLogging('admin.bookings.cancel', handlePOST);
