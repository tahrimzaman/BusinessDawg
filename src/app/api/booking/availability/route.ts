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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fromParam = url.searchParams.get('from');
  const toParam = url.searchParams.get('to');

  const now = Date.now();

  const rule = await getBookingRule();

  const fromUtc = fromParam ? Date.parse(fromParam + 'T00:00:00Z') : now;
  const toUtc = toParam
    ? Date.parse(toParam + 'T23:59:59Z')
    : now + rule.maxHorizonDays * 86_400_000;

  if (!Number.isFinite(fromUtc) || !Number.isFinite(toUtc)) {
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
