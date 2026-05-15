/**
 * DELETE /api/admin/bookings/[id] — hard delete. Requires ?confirm=delete
 * query param so a misclick can't nuke a row. Cascades to BookingEvent
 * (configured at the schema level via onDelete: Cascade).
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthed } from '@/lib/admin/auth';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handleDELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const url = new URL(req.url);
  if (url.searchParams.get('confirm') !== 'delete') {
    return NextResponse.json({ error: 'missing confirm=delete' }, { status: 400 });
  }
  const { id } = await ctx.params;
  const existing = await prisma.booking.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
  await prisma.booking.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export const DELETE = withLogging('admin.bookings.delete', handleDELETE);
