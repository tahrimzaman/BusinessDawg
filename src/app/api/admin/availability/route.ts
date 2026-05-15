/**
 * Admin-gated availability management. GET returns the current weekly
 * windows + exceptions; POST replaces all of them in a single transaction.
 * Replace-all is the simplest contract for a UI that always submits the
 * full state from a single "Save changes" button.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { isAuthed } from '@/lib/admin/auth';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HHmm = /^\d{1,2}:\d{2}$/;

const WindowSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(HHmm),
  endTime: z.string().regex(HHmm),
  active: z.boolean().optional().default(true),
});

const ExceptionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  blocked: z.boolean(),
  startTime: z.string().regex(HHmm).nullable().optional(),
  endTime: z.string().regex(HHmm).nullable().optional(),
  reason: z.string().max(200).nullable().optional(),
});

const Payload = z.object({
  windows: z.array(WindowSchema).max(50),
  exceptions: z.array(ExceptionSchema).max(200),
});

async function handleGET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const [windows, exceptions] = await Promise.all([
    prisma.availabilityWindow.findMany({ orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] }),
    prisma.availabilityException.findMany({ orderBy: { date: 'asc' } }),
  ]);
  return NextResponse.json({
    windows: windows.map((w) => ({
      id: w.id,
      dayOfWeek: w.dayOfWeek,
      startTime: w.startTime,
      endTime: w.endTime,
      active: w.active,
    })),
    exceptions: exceptions.map((e) => ({
      id: e.id,
      date: e.date.toISOString().slice(0, 10),
      blocked: e.blocked,
      startTime: e.startTime,
      endTime: e.endTime,
      reason: e.reason,
    })),
  });
}

async function handlePOST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const raw = await req.json().catch(() => null);
  const parsed = Payload.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { windows, exceptions } = parsed.data;

  await prisma.$transaction([
    prisma.availabilityWindow.deleteMany({}),
    prisma.availabilityException.deleteMany({}),
    prisma.availabilityWindow.createMany({
      data: windows.map((w) => ({
        dayOfWeek: w.dayOfWeek,
        startTime: w.startTime,
        endTime: w.endTime,
        active: w.active ?? true,
      })),
    }),
    prisma.availabilityException.createMany({
      data: exceptions.map((e) => ({
        date: new Date(e.date + 'T00:00:00Z'),
        blocked: e.blocked,
        startTime: e.startTime ?? null,
        endTime: e.endTime ?? null,
        reason: e.reason ?? null,
      })),
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export const GET = withLogging('admin.availability.list', handleGET);

export const POST = withLogging('admin.availability.update', handlePOST);
