/**
 * GET /api/admin/bookings — admin-gated list endpoint. Returns the latest
 * 500 bookings as JSON. The /admin page reads bookings server-side via Prisma
 * directly, so this endpoint is mainly here for future filters / pagination
 * and for any client-side refresh after status changes.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthed } from '@/lib/admin/auth';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handleGET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const rows = await prisma.booking.findMany({
    orderBy: { startUtc: 'desc' },
    take: 500,
    select: {
      id: true,
      name: true,
      email: true,
      intent: true,
      status: true,
      startUtc: true,
      visitorTz: true,
      needsMeetLink: true,
    },
  });
  return NextResponse.json({
    bookings: rows.map((b) => ({
      ...b,
      startUtc: b.startUtc.toISOString(),
    })),
  });
}

export const GET = withLogging('admin.bookings.list', handleGET);
