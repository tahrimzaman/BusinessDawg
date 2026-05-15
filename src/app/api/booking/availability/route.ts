/**
 * GET /api/booking/availability — returns the bookable slots inside the
 * visitor's chosen window, computed live from BookingRule + AvailabilityWindow
 * + AvailabilityException, minus existing bookings and active holds.
 *
 * Query params (optional): ?from=YYYY-MM-DD&to=YYYY-MM-DD in visitor's tz.
 * Defaults to "today through maxHorizonDays from now" if not supplied.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getBookingRule } from '@/lib/booking/rules';
import { generateSlots } from '@/lib/booking/slots';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handleGET(req: Request) {
  const url = new URL(req.url);
  const fromParam = url.searchParams.get('from');
  const toParam = url.searchParams.get('to');

  const now = Date.now();

  const rule = await getBookingRule();

  // Parse YYYY-MM-DD explicitly instead of concatenating into Date.parse.
  // `Date.parse('2025-13-45T00:00:00Z')` returns NaN as we want, but
  // `Date.parse('2025-13-01T00:00:00Z')` quietly rolls into 2026-01-01 in
  // some engines. Strict regex → Date.UTC removes that whole class of bug.
  const parseDateParam = (p: string | null, endOfDay: boolean): number | null => {
    if (!p) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(p);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return Date.UTC(y, mo - 1, d, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0);
  };

  const fromUtc = fromParam ? parseDateParam(fromParam, false) : now;
  const toUtc = toParam ? parseDateParam(toParam, true) : now + rule.maxHorizonDays * 86_400_000;

  if (fromUtc === null || toUtc === null || !Number.isFinite(fromUtc) || !Number.isFinite(toUtc)) {
    return NextResponse.json({ error: 'invalid from/to' }, { status: 400 });
  }

  const [windows, exceptions, futureBookings, activeHolds] = await Promise.all([
    prisma.availabilityWindow.findMany(),
    prisma.availabilityException.findMany({
      where: {
        date: {
          gte: new Date(fromUtc - 86_400_000),
          lte: new Date(toUtc + 86_400_000),
        },
      },
    }),
    prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'RESCHEDULED'] },
        startUtc: { lte: new Date(toUtc + 86_400_000) },
        endUtc: { gte: new Date(fromUtc - 86_400_000) },
      },
      select: { startUtc: true, endUtc: true },
    }),
    prisma.slotHold.findMany({
      where: {
        expiresAt: { gt: new Date(now) },
        startUtc: { lte: new Date(toUtc + 86_400_000) },
        endUtc: { gte: new Date(fromUtc - 86_400_000) },
      },
      select: { startUtc: true, endUtc: true },
    }),
  ]);

  const slots = generateSlots({
    fromUtc,
    toUtc,
    now,
    rule: {
      durationMin: rule.durationMin,
      minNoticeMin: rule.minNoticeMin,
      maxHorizonDays: rule.maxHorizonDays,
      bufferMin: rule.bufferMin,
      maxPerDay: rule.maxPerDay,
      ownerTz: rule.ownerTz,
    },
    windows: windows.map((w) => ({
      dayOfWeek: w.dayOfWeek,
      startTime: w.startTime,
      endTime: w.endTime,
      active: w.active,
    })),
    exceptions: exceptions.map((e) => ({
      date: e.date.toISOString().slice(0, 10),
      blocked: e.blocked,
      startTime: e.startTime,
      endTime: e.endTime,
    })),
    bookings: futureBookings.map((b) => ({
      startUtc: b.startUtc.getTime(),
      endUtc: b.endUtc.getTime(),
    })),
    holds: activeHolds.map((h) => ({
      startUtc: h.startUtc.getTime(),
      endUtc: h.endUtc.getTime(),
    })),
  });

  return NextResponse.json(
    { slots, ownerTz: rule.ownerTz, durationMin: rule.durationMin },
    { headers: { 'cache-control': 'no-store' } },
  );
}

export const GET = withLogging('booking.availability', handleGET);
