/**
 * POST /api/admin/google/disconnect — wipe the GoogleToken row so future
 * bookings fall through to the manual-Meet-link path. We do not call
 * Google to revoke the token — the admin can do that explicitly at
 * myaccount.google.com if they want.
 */

import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/admin/auth';
import { prisma } from '@/lib/db/prisma';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handlePOST() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  await prisma.googleToken.deleteMany({ where: { id: 'singleton' } });
  return NextResponse.json({ ok: true });
}

export const POST = withLogging('admin.google.disconnect', handlePOST);
