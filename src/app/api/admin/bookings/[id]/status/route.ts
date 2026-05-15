/**
 * PATCH /api/admin/bookings/[id]/status — change a booking's status to
 * COMPLETED, NO_SHOW, or back to CONFIRMED. Writes a BookingEvent for the
 * activity log. CANCELLED goes through the cancel route (sends an email).
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { isAuthed } from '@/lib/admin/auth';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  status: z.enum(['CONFIRMED', 'COMPLETED', 'NO_SHOW']),
});

async function handlePATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const raw = await req.json().catch(() => null);
  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }
  const current = await prisma.booking.findUnique({ where: { id }, select: { status: true } });
  if (!current) return NextResponse.json({ error: 'not found' }, { status: 404 });

  await prisma.$transaction([
    prisma.booking.update({ where: { id }, data: { status: parsed.data.status } }),
    prisma.bookingEvent.create({
      data: {
        bookingId: id,
        type: 'status_changed',
        payload: { from: current.status, to: parsed.data.status },
      },
    }),
  ]);

  return NextResponse.json({ ok: true, status: parsed.data.status });
}

export const PATCH = withLogging('admin.bookings.status', handlePATCH);
