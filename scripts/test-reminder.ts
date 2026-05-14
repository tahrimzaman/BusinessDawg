/**
 * Verification helper: shift the most recent CONFIRMED test booking into the
 * reminder window (now + 24h), null out reminder24Sent, hit the cron, then
 * confirm reminder24Sent got stamped.
 */

import { prisma } from '../src/lib/db/prisma';

(async () => {
  const target = await prisma.booking.findFirst({
    where: {
      status: 'CONFIRMED',
      email: { contains: 'example.com' }, // only touch test rows
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!target) {
    console.error('No test booking to shift.');
    process.exit(1);
  }
  const newStart = new Date(Date.now() + 24 * 3_600_000);
  await prisma.booking.update({
    where: { id: target.id },
    data: {
      startUtc: newStart,
      endUtc: new Date(newStart.getTime() + 15 * 60_000),
      reminder24Sent: null,
    },
  });
  console.log('Shifted booking', target.id, 'to', newStart.toISOString());

  const url = process.env.CRON_SECRET
    ? 'http://localhost:3000/api/booking/reminders'
    : 'http://localhost:3000/api/booking/reminders';
  const headers: Record<string, string> = {};
  if (process.env.CRON_SECRET) {
    headers.authorization = `Bearer ${process.env.CRON_SECRET}`;
  }
  const res = await fetch(url, { headers });
  console.log('Cron response:', res.status, await res.text());

  const after = await prisma.booking.findUnique({
    where: { id: target.id },
    select: { reminder24Sent: true, events: { select: { type: true } } },
  });
  console.log('reminder24Sent:', after?.reminder24Sent);
  console.log(
    'events:',
    after?.events.map((e) => e.type),
  );

  // Trigger again to prove idempotency.
  const res2 = await fetch(url, { headers });
  console.log('Second run:', res2.status, await res2.text());

  await prisma.$disconnect();
})();
