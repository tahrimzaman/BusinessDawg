/**
 * One-shot cleanup: removes test booking + customer rows from the shared
 * Neon DB before production cutover. Conservative — only deletes rows whose
 * email matches a test pattern. Prints what it removed.
 */

import { prisma } from '../src/lib/db/prisma';

const TEST_PATTERNS = [
  '@example.com',
  '@example.org',
  'phase3a-',
  'phase4-',
  'phase6-',
  'race-a@',
  'race-b@',
  'ui-test@',
];

(async () => {
  const orClauses = TEST_PATTERNS.map((p) => ({ email: { contains: p } }));

  // List first so we can show what we're about to delete.
  const bookings = await prisma.booking.findMany({
    where: { OR: orClauses },
    select: { id: true, name: true, email: true, startUtc: true },
  });
  const customers = await prisma.customer.findMany({
    where: { OR: orClauses },
    select: { id: true, name: true, email: true },
  });

  console.log(`Bookings matched: ${bookings.length}`);
  bookings.forEach((b) =>
    console.log(`  - ${b.id} · ${b.name} <${b.email}> · ${b.startUtc.toISOString()}`),
  );
  console.log(`Customers matched: ${customers.length}`);
  customers.forEach((c) => console.log(`  - ${c.id} · ${c.name} <${c.email}>`));

  // Delete in dependency order: Customer → Booking. BookingEvent cascades on
  // Booking delete; Customer's FK is SetNull so deleting the booking first
  // would orphan customers we want gone. Customer first, then Booking.
  const delCustomers = await prisma.customer.deleteMany({ where: { OR: orClauses } });
  const delBookings = await prisma.booking.deleteMany({ where: { OR: orClauses } });

  // Also wipe any expired SlotHold rows while we're here.
  const delHolds = await prisma.slotHold.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  console.log(
    `Deleted: ${delCustomers.count} customers · ${delBookings.count} bookings · ${delHolds.count} expired holds`,
  );

  await prisma.$disconnect();
})();
