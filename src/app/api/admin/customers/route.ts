/**
 * GET /api/admin/customers — list endpoint for the Customers tab. The /admin
 * page reads server-side via Prisma directly; this exists for future
 * client-side refreshes after stage changes.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthed } from '@/lib/admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const rows = await prisma.customer.findMany({
    orderBy: [{ stage: 'asc' }, { desiredDeadline: 'asc' }, { updatedAt: 'desc' }],
    take: 500,
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      stage: true,
      desiredDeadline: true,
      promotedAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json({
    customers: rows.map((c) => ({
      ...c,
      desiredDeadline: c.desiredDeadline ? c.desiredDeadline.toISOString() : null,
      promotedAt: c.promotedAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
  });
}
