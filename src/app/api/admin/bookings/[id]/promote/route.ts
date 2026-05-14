/**
 * POST /api/admin/bookings/[id]/promote — promote a Lead (Booking) into a
 * Customer. Creates a Customer row linked to the booking, denormalizing
 * name/email/company/phone, and seeds serviceDescription with the booking's
 * intent so Tahrim has a starting point. Idempotent: if a Customer already
 * exists for this booking, returns its id without creating a duplicate.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthed } from '@/lib/admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { customer: { select: { id: true } } },
  });
  if (!booking) return NextResponse.json({ error: 'not found' }, { status: 404 });

  if (booking.customer) {
    return NextResponse.json({ ok: true, customerId: booking.customer.id, alreadyPromoted: true });
  }

  const [customer] = await prisma.$transaction([
    prisma.customer.create({
      data: {
        bookingId: booking.id,
        name: booking.name,
        email: booking.email,
        company: booking.company,
        phone: booking.phone,
        serviceDescription: booking.intent,
      },
    }),
    prisma.bookingEvent.create({
      data: {
        bookingId: booking.id,
        type: 'promoted',
        payload: { actor: 'admin' },
      },
    }),
  ]);

  return NextResponse.json({ ok: true, customerId: customer.id });
}
