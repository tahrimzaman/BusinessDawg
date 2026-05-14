/**
 * GET /api/booking/reminders — daily cron. Sends 24h-out reminders for any
 * CONFIRMED/RESCHEDULED booking that's coming up tomorrow and hasn't been
 * reminded yet. Idempotent — gated by the reminder24Sent column so a double
 * trigger doesn't double-email. Also cleans up expired SlotHold rows.
 *
 * Auth: Vercel Cron sets `Authorization: Bearer ${CRON_SECRET}` (or the
 * built-in x-vercel-cron header when running on Vercel). Manual triggers
 * must supply the same Bearer token.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getBookingRule } from '@/lib/booking/rules';
import { notifyVisitorBookingReminder } from '@/lib/email/booking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Dev convenience: when CRON_SECRET isn't set, only allow localhost calls.
    if (process.env.NODE_ENV !== 'production') return true;
    return false;
  }
  const header = req.headers.get('authorization');
  if (!header) return false;
  return header === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  // Reminder window: bookings starting between now+12h and now+36h.
  // Catches both "tomorrow morning" and "tomorrow evening" calls on a single
  // daily run regardless of when within the day the cron fires.
  const windowStart = new Date(now + 12 * 3_600_000);
  const windowEnd = new Date(now + 36 * 3_600_000);

  const due = await prisma.booking.findMany({
    where: {
      status: { in: ['CONFIRMED', 'RESCHEDULED'] },
      reminder24Sent: null,
      startUtc: { gte: windowStart, lte: windowEnd },
    },
  });

  const rule = await getBookingRule();
  let sent = 0;
  let failed = 0;

  for (const b of due) {
    try {
      await notifyVisitorBookingReminder({
        id: b.id,
        name: b.name,
        email: b.email,
        company: b.company,
        role: b.role,
        phone: b.phone,
        intent: b.intent,
        source: b.source,
        startUtc: b.startUtc,
        endUtc: b.endUtc,
        visitorTz: b.visitorTz,
        ownerTz: rule.ownerTz,
        meetingTitle: rule.meetingTitle,
        meetUrl: b.meetUrl,
        tokenVersion: b.tokenVersion,
      });
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: b.id },
          data: { reminder24Sent: new Date() },
        }),
        prisma.bookingEvent.create({
          data: { bookingId: b.id, type: 'reminder_sent', payload: { kind: '24h' } },
        }),
      ]);
      sent++;
    } catch (err) {
      console.error('[/api/booking/reminders] failed for', b.id, err);
      failed++;
    }
  }

  // Clean up expired holds while we're here.
  const cleaned = await prisma.slotHold.deleteMany({
    where: { expiresAt: { lt: new Date(now) } },
  });

  return NextResponse.json({
    ok: true,
    candidates: due.length,
    sent,
    failed,
    holdsCleaned: cleaned.count,
  });
}
