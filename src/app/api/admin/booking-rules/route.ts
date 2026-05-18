/**
 * Admin-gated booking-rules singleton. GET reads (and upserts default on
 * first read via getBookingRule). POST updates configurable fields,
 * including durationMin (intro calls default to 30 min but can be
 * adjusted to 15 / 30 / 45 / 60 via the admin panel).
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { isAuthed } from '@/lib/admin/auth';
import { getBookingRule } from '@/lib/booking/rules';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RulePayload = z.object({
  durationMin: z.union([z.literal(15), z.literal(30), z.literal(45), z.literal(60)]),
  minNoticeMin: z
    .number()
    .int()
    .min(0)
    .max(7 * 24 * 60),
  maxHorizonDays: z.number().int().min(1).max(365),
  bufferMin: z.number().int().min(0).max(180),
  maxPerDay: z.number().int().min(1).max(48),
  ownerTz: z.string().min(1).max(60),
  meetingTitle: z.string().min(1).max(200),
});

async function handleGET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const rule = await getBookingRule();
  return NextResponse.json({
    durationMin: rule.durationMin,
    minNoticeMin: rule.minNoticeMin,
    maxHorizonDays: rule.maxHorizonDays,
    bufferMin: rule.bufferMin,
    maxPerDay: rule.maxPerDay,
    ownerTz: rule.ownerTz,
    meetingTitle: rule.meetingTitle,
  });
}

async function handlePOST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const raw = await req.json().catch(() => null);
  const parsed = RulePayload.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // Validate ownerTz is a real IANA zone.
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: parsed.data.ownerTz });
  } catch {
    return NextResponse.json({ error: 'invalid timezone' }, { status: 400 });
  }

  const updated = await prisma.bookingRule.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json({
    durationMin: updated.durationMin,
    minNoticeMin: updated.minNoticeMin,
    maxHorizonDays: updated.maxHorizonDays,
    bufferMin: updated.bufferMin,
    maxPerDay: updated.maxPerDay,
    ownerTz: updated.ownerTz,
    meetingTitle: updated.meetingTitle,
  });
}

export const GET = withLogging('admin.bookingRules.get', handleGET);

export const POST = withLogging('admin.bookingRules.update', handlePOST);
