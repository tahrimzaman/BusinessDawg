/**
 * Admin booking detail — single-source-of-truth view for a booking. Server
 * component fetches the booking + activity log + repeat-visitor context
 * (prior bookings + newsletter signup + intern application matched by email),
 * then hands off to BookingDetailClient for the interactive bits.
 */

import { notFound, redirect } from 'next/navigation';
import { isAuthed } from '@/lib/admin/auth';
import { prisma } from '@/lib/db/prisma';
import { getBookingRule } from '@/lib/booking/rules';
import BookingDetailClient from './BookingDetailClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Booking detail' };

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) redirect('/admin/login');
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      events: { orderBy: { createdAt: 'desc' } },
      customer: { select: { id: true, stage: true } },
    },
  });
  if (!booking) notFound();

  const [priorBookings, subscriber, application, rule] = await Promise.all([
    prisma.booking.findMany({
      where: { email: booking.email, NOT: { id: booking.id } },
      orderBy: { startUtc: 'desc' },
      take: 10,
      select: {
        id: true,
        startUtc: true,
        status: true,
        intent: true,
      },
    }),
    prisma.subscriber.findUnique({ where: { email: booking.email } }),
    prisma.application.findFirst({
      where: { email: booking.email },
      orderBy: { createdAt: 'desc' },
    }),
    getBookingRule(),
  ]);

  return (
    <BookingDetailClient
      customer={
        booking.customer ? { id: booking.customer.id, stage: booking.customer.stage } : null
      }
      booking={{
        id: booking.id,
        name: booking.name,
        email: booking.email,
        company: booking.company,
        role: booking.role,
        phone: booking.phone,
        intent: booking.intent,
        source: booking.source,
        startUtc: booking.startUtc.toISOString(),
        endUtc: booking.endUtc.toISOString(),
        visitorTz: booking.visitorTz,
        status: booking.status,
        meetUrl: booking.meetUrl,
        needsMeetLink: booking.needsMeetLink,
        utmSource: booking.utmSource,
        utmMedium: booking.utmMedium,
        utmCampaign: booking.utmCampaign,
        utmTerm: booking.utmTerm,
        utmContent: booking.utmContent,
        referrer: booking.referrer,
        landingPage: booking.landingPage,
        approxLocation: booking.approxLocation,
        createdAt: booking.createdAt.toISOString(),
        events: booking.events.map((e) => ({
          id: e.id,
          type: e.type,
          payload: e.payload as Record<string, unknown> | null,
          createdAt: e.createdAt.toISOString(),
        })),
      }}
      ownerTz={rule.ownerTz}
      meetingTitle={rule.meetingTitle}
      priorBookings={priorBookings.map((p) => ({
        id: p.id,
        startUtc: p.startUtc.toISOString(),
        status: p.status,
        intent: p.intent,
      }))}
      subscriber={
        subscriber
          ? {
              source: subscriber.source,
              createdAt: subscriber.createdAt.toISOString(),
            }
          : null
      }
      application={
        application
          ? {
              role: application.role,
              portfolio: application.portfolio,
              note: application.note,
              createdAt: application.createdAt.toISOString(),
            }
          : null
      }
    />
  );
}
