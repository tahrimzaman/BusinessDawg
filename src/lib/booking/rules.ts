/**
 * Singleton accessor for the booking rules row. Reads the one row keyed
 * "singleton"; lazily upserts it with sensible defaults on first read so the
 * rest of the system can assume it always exists. The defaults match the
 * @default values in schema.prisma, but we duplicate them here so the
 * fallback works on a fresh database without depending on schema-level
 * defaults firing for upsert.
 */

import { prisma } from '@/lib/db/prisma';

export const DEFAULT_RULE = {
  durationMin: 30,
  minNoticeMin: 240,
  maxHorizonDays: 21,
  bufferMin: 15,
  maxPerDay: 4,
  ownerTz: 'Asia/Dhaka',
  meetingTitle: 'BusinessDawg discovery — 30 min',
};

export async function getBookingRule() {
  const existing = await prisma.bookingRule.findUnique({ where: { id: 'singleton' } });
  if (existing) return existing;
  return prisma.bookingRule.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...DEFAULT_RULE },
    update: {},
  });
}
