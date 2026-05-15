/**
 * GET /api/cron/purge-pii — periodic PII retention cleanup.
 *
 * Deletes:
 *   - Subscriber rows older than 365 days. Newsletter signups age out.
 *   - Application rows older than 365 days. Intern apps age out.
 *   - Booking rows with status=CANCELLED and updatedAt older than 365 days.
 *     CONFIRMED/RESCHEDULED/COMPLETED bookings stay forever — they're real
 *     business history. NO_SHOW also stays (Tahrim might want it for
 *     pattern-spotting).
 *   - EmailOutbox rows with status='sent' or older than 30 days. Outbox is
 *     a recovery queue, not a permanent log.
 *   - AdminAudit rows older than 365 days. Audit trail bounded.
 *
 * Idempotent — running twice is a no-op the second time (the conditions
 * stop matching once rows are gone).
 *
 * Auth: same Bearer-token model as /api/booking/reminders. Hostinger cron
 * jobs (hPanel → Advanced → Cron Jobs) can curl this daily with the header
 * set; or wire any external scheduler (cron-job.org, GitHub Actions, etc.).
 *
 * Schedule suggestion: once a day at 4:00 AM Bangladesh time (off-peak).
 *   curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://businessdawg.com/api/cron/purge-pii
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { withLogging } from '@/lib/log/route';
import { log } from '@/lib/log/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Fail-loud at module load if CRON_SECRET is missing in production — same
// rationale as /api/booking/reminders.
if (process.env.NODE_ENV === 'production' && !process.env.CRON_SECRET) {
  throw new Error('CRON_SECRET required in production for /api/cron/purge-pii');
}

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV !== 'production') return true;
    return false;
  }
  const header = req.headers.get('authorization');
  return header === `Bearer ${secret}`;
}

const DAY_MS = 86_400_000;
const RETENTION_DAYS = 365;
const OUTBOX_RETENTION_DAYS = 30;

async function handleGET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const cutoff365 = new Date(now - RETENTION_DAYS * DAY_MS);
  const cutoff30 = new Date(now - OUTBOX_RETENTION_DAYS * DAY_MS);

  // Run deletes in parallel — they touch independent tables. Use deleteMany
  // count, not Promise.allSettled, because a failure here means something
  // structural is broken and we want the route to 500 visibly.
  const [subscribers, applications, bookings, outbox, audit] = await Promise.all([
    prisma.subscriber.deleteMany({ where: { createdAt: { lt: cutoff365 } } }),
    prisma.application.deleteMany({ where: { createdAt: { lt: cutoff365 } } }),
    prisma.booking.deleteMany({
      where: { status: 'CANCELLED', updatedAt: { lt: cutoff365 } },
    }),
    prisma.emailOutbox.deleteMany({
      where: {
        OR: [{ status: 'sent' }, { createdAt: { lt: cutoff30 } }],
      },
    }),
    prisma.adminAudit.deleteMany({ where: { createdAt: { lt: cutoff365 } } }),
  ]);

  const summary = {
    subscribers: subscribers.count,
    applications: applications.count,
    cancelledBookings: bookings.count,
    emailOutbox: outbox.count,
    adminAudit: audit.count,
  };

  log('info', 'cron.purge_pii.complete', summary);

  return NextResponse.json({ ok: true, deleted: summary });
}

export const GET = withLogging('cron.purge_pii', handleGET);
