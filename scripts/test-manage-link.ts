/**
 * One-off verification helper. Mints a manage token for the most recent
 * non-cancelled booking and prints the /booking/[token]/manage URL so we can
 * test the public page without going through email.
 */

import { prisma } from '../src/lib/db/prisma';
import { signManageToken } from '../src/lib/booking/tokens';

(async () => {
  const booking = await prisma.booking.findFirst({
    where: { status: { in: ['CONFIRMED', 'RESCHEDULED'] } },
    orderBy: { createdAt: 'desc' },
  });
  if (!booking) {
    console.error('No non-cancelled bookings.');
    process.exit(1);
  }
  const token = signManageToken({
    bookingId: booking.id,
    tokenVersion: booking.tokenVersion,
    endUtc: booking.endUtc,
  });
  console.log('Booking:', booking.id, booking.name, '·', booking.startUtc.toISOString());
  console.log('Token:  ', token);
  console.log('URL:     http://localhost:3000/booking/' + token + '/manage');
  await prisma.$disconnect();
})();
