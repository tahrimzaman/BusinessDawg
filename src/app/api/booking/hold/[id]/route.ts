/**
 * DELETE /api/booking/hold/[id] — release a SlotHold explicitly. Best-effort:
 * unknown ids return 200 (idempotent) so the client doesn't need to think
 * about whether the hold already expired between creation and unmount.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';

async function handleDELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await ctx.params;
  await prisma.slotHold.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}

export const DELETE = withLogging('booking.hold.delete', handleDELETE);
