/**
 * One-shot seed for testing: Mon–Fri 10:00–18:00 Asia/Dhaka, no exceptions.
 * Wipe with `tsx scripts/seed-availability.ts --clear` (or just resave from
 * /admin → Availability once you have a real login).
 */

import { prisma } from '../src/lib/db/prisma';

async function main() {
  const clear = process.argv.includes('--clear');

  await prisma.availabilityWindow.deleteMany({});
  await prisma.availabilityException.deleteMany({});

  if (clear) {
    console.log('Cleared all windows + exceptions.');
    return;
  }

  // Mon=1 ... Fri=5
  const data = [1, 2, 3, 4, 5].map((dayOfWeek) => ({
    dayOfWeek,
    startTime: '10:00',
    endTime: '18:00',
    active: true,
  }));
  await prisma.availabilityWindow.createMany({ data });

  // Block one Thursday two weeks out to prove exceptions work.
  const thursday = new Date();
  while (thursday.getDay() !== 4) thursday.setDate(thursday.getDate() + 1);
  thursday.setDate(thursday.getDate() + 7);
  await prisma.availabilityException.create({
    data: {
      date: new Date(thursday.toISOString().slice(0, 10) + 'T00:00:00Z'),
      blocked: true,
      reason: 'Test block — second Thursday',
    },
  });

  console.log(
    'Seeded: Mon–Fri 10:00–18:00 Asia/Dhaka, block on',
    thursday.toISOString().slice(0, 10),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
