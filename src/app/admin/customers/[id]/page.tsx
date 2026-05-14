/**
 * Admin customer detail — single-source-of-truth view for an ongoing
 * engagement. Server fetches the customer + the source booking (if any) +
 * any prior bookings with the same email for context, then hands off to
 * CustomerDetailClient for the interactive editor.
 */

import { notFound, redirect } from 'next/navigation';
import { isAuthed } from '@/lib/admin/auth';
import { prisma } from '@/lib/db/prisma';
import { getBookingRule } from '@/lib/booking/rules';
import CustomerDetailClient from './CustomerDetailClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Customer detail' };

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) redirect('/admin/login');
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      booking: {
        select: {
          id: true,
          startUtc: true,
          visitorTz: true,
          intent: true,
          status: true,
        },
      },
    },
  });
  if (!customer) notFound();

  const [priorBookings, rule] = await Promise.all([
    prisma.booking.findMany({
      where: {
        email: customer.email,
        ...(customer.bookingId ? { NOT: { id: customer.bookingId } } : {}),
      },
      orderBy: { startUtc: 'desc' },
      take: 10,
      select: { id: true, startUtc: true, status: true, intent: true },
    }),
    getBookingRule(),
  ]);

  return (
    <CustomerDetailClient
      customer={{
        id: customer.id,
        bookingId: customer.bookingId,
        name: customer.name,
        email: customer.email,
        company: customer.company,
        phone: customer.phone,
        serviceDescription: customer.serviceDescription,
        desiredDeadline: customer.desiredDeadline ? customer.desiredDeadline.toISOString() : null,
        pricingNotes: customer.pricingNotes,
        internalNotes: customer.internalNotes,
        stage: customer.stage,
        promotedAt: customer.promotedAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
      }}
      sourceBooking={
        customer.booking
          ? {
              id: customer.booking.id,
              startUtc: customer.booking.startUtc.toISOString(),
              visitorTz: customer.booking.visitorTz,
              intent: customer.booking.intent,
              status: customer.booking.status,
            }
          : null
      }
      priorBookings={priorBookings.map((p) => ({
        id: p.id,
        startUtc: p.startUtc.toISOString(),
        status: p.status,
        intent: p.intent,
      }))}
      ownerTz={rule.ownerTz}
    />
  );
}
