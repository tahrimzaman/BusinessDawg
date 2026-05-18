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
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Fail-loud at module load if CRON_SECRET is missing in production. The dev
// fallback inside isAuthorized() is fine for local — but on a real deploy a
// missing secret would silently allow unauthenticated reminder triggers,
// which can send live emails. Throwing here keeps that failure mode out of
// the loaded-handler universe.
if (process.env.NODE_ENV === 'production' && !process.env.CRON_SECRET) {
  throw new Error('CRON_SECRET required in production for /api/booking/reminders');
}

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

async function handleGET(req: Request) {
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
      const result = await notifyVisitorBookingReminder({
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
      // Only flip reminder24Sent on a real successful send. sendWithRetry
      // returns {ok: false} on exhausted retries (and has already written to
      // EmailOutbox for manual replay). If we flipped the flag on failure,
      // tomorrow's cron would skip this booking and the visitor would never
      // get a reminder. The outbox row is the dead-letter; admin can replay
      // from there. Until they do, we leave the flag null so the next cron
      // tick re-attempts.
      if (!result.ok) {
        failed++;
        continue;
      }
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

export const GET = withLogging('booking.reminders.cron', handleGET);
