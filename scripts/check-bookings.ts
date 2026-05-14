import { prisma } from '../src/lib/db/prisma';

(async () => {
  const rows = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      startUtc: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      referrer: true,
      landingPage: true,
      approxLocation: true,
      events: { select: { type: true, createdAt: true } },
    },
  });
  console.log(JSON.stringify(rows, null, 2));
  await prisma.$disconnect();
})();
