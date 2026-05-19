/**
 * Public page for visitors to reschedule or cancel their booking. Decodes the
 * manage token server-side, fetches the booking + the live slot list (so we
 * never offer a slot that's already taken), and hands off to the client UI.
 * Pages auth themselves — the HMAC token IS the credential.
 */

import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { verifyManageToken } from '@/lib/booking/tokens';
import { prisma } from '@/lib/db/prisma';
import type { Slot } from '@/components/booking/SlotList';
import ManageBooking from '@/components/booking/ManageBooking';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Manage booking',
  robots: { index: false, follow: false },
};

async function fetchSlots(): Promise<Slot[]> {
  const h = await headers();
  const host = h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  try {
    const res = await fetch(`${proto}://${host}/api/booking/availability`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = (await res.json()) as { slots: Slot[] };
    return json.slots ?? [];
  } catch {
    return [];
  }
}

export default async function ManageBookingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const decoded = verifyManageToken(token);
  if (!decoded) notFound();

  const booking = await prisma.booking.findUnique({ where: { id: decoded.bookingId } });
  if (!booking) notFound();
  if (booking.tokenVersion !== decoded.tokenVersion) notFound();

  const slots = await fetchSlots();

  return (
    <div className="mx-auto max-w-3xl px-6 pt-40 pb-24">
      <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
        / Manage booking
      </p>
      <h1 className="font-display mt-3 text-4xl leading-[1.02] font-extrabold tracking-tight italic sm:text-5xl">
        Reschedule or cancel.
      </h1>
      <p className="mt-4 text-[color:var(--bd-bone)]/70">
        Hey {booking.name.split(' ')[0] || booking.name}, change your slot or cancel below. Email
        confirmations go to {booking.email}.
      </p>
      <div className="mt-12">
        <ManageBooking
          token={token}
          booking={{
            id: booking.id,
            startUtc: booking.startUtc.toISOString(),
            endUtc: booking.endUtc.toISOString(),
            status: booking.status,
            visitorTz: booking.visitorTz,
            meetUrl: booking.meetUrl,
          }}
          slots={slots}
        />
      </div>
    </div>
  );
}
