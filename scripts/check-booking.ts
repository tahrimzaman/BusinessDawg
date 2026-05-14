import { prisma } from '../src/lib/db/prisma';

(async () => {
  const id = process.argv[2];
  if (!id) {
    console.error('usage: tsx scripts/check-booking.ts <bookingId>');
    process.exit(1);
  }
  const b = await prisma.booking.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      startUtc: true,
      meetUrl: true,
      gcalEventId: true,
      needsMeetLink: true,
      events: { select: { type: true, createdAt: true } },
    },
  });
  console.log(JSON.stringify(b, null, 2));
  await prisma.$disconnect();
})();
