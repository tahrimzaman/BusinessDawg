import { prisma } from '../src/lib/db/prisma';

(async () => {
  // Pick the most-recent booking and create a customer for it directly.
  const booking = await prisma.booking.findFirst({
    where: { customer: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!booking) {
    console.log('No unpromoted bookings.');
    await prisma.$disconnect();
    return;
  }
  const customer = await prisma.customer.create({
    data: {
      bookingId: booking.id,
      name: booking.name,
      email: booking.email,
      company: booking.company,
      phone: booking.phone,
      serviceDescription: booking.intent,
      stage: 'PROSPECT',
    },
  });
  console.log('Created customer:', customer.id, 'for booking:', booking.id);
  await prisma.$disconnect();
})();
