/**
 * One-shot: flip the live BookingRule singleton from 15-min to 30-min calls.
 * Run with `tsx scripts/set-30min.ts`. Safe to re-run.
 *
 * Existing future bookings keep their original start/end UTC — only new
 * slot generation is affected.
 */

import { prisma } from '../src/lib/db/prisma';

async function main() {
  const updated = await prisma.bookingRule.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      durationMin: 30,
      minNoticeMin: 240,
      maxHorizonDays: 21,
      bufferMin: 15,
      maxPerDay: 4,
      ownerTz: 'Asia/Dhaka',
      meetingTitle: 'BusinessDawg discovery — 30 min',
    },
    update: {
      durationMin: 30,
      meetingTitle: 'BusinessDawg discovery — 30 min',
    },
  });
   
  console.log('BookingRule updated:', {
    durationMin: updated.durationMin,
    meetingTitle: updated.meetingTitle,
  });
}

main()
  .catch((err) => {
     
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
