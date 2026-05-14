/**
 * GET /api/booking/[token] — decode the manage token and return a sanitized
 * booking summary the public /booking/[token]/manage page can render.
 * Returns 404 on bad / expired tokens or stale tokenVersion (e.g. after
 * a previous cancel).
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyManageToken } from '@/lib/booking/tokens';
import { getBookingRule } from '@/lib/booking/rules';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  const { token } = await ctx.params;
  const decoded = verifyManageToken(token);
  if (!decoded) return NextResponse.json({ error: 'invalid or expired' }, { status: 404 });

  const booking = await prisma.booking.findUnique({
    where: { id: decoded.bookingId },
    select: {
      id: true,
      name: true,
      email: true,
      startUtc: true,
      endUtc: true,
      status: true,
      visitorTz: true,
      tokenVersion: true,
      meetUrl: true,
    },
  });
  if (!booking) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (booking.tokenVersion !== decoded.tokenVersion) {
    return NextResponse.json({ error: 'token superseded' }, { status: 410 });
  }

  const rule = await getBookingRule();

  return NextResponse.json({
    booking: {
      id: booking.id,
      // Send first name only — keeps the page friendly without leaking the
      // full identity if someone gets hold of the token.
      firstName: booking.name.split(' ')[0] || booking.name,
      email: booking.email,
      startUtc: booking.startUtc.toISOString(),
      endUtc: booking.endUtc.toISOString(),
      status: booking.status,
      visitorTz: booking.visitorTz,
      meetUrl: booking.meetUrl,
    },
    ownerTz: rule.ownerTz,
    durationMin: rule.durationMin,
    meetingTitle: rule.meetingTitle,
  });
}
