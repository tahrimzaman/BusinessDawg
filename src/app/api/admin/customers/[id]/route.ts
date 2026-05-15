/**
 * Customer detail mutations. PATCH updates editable fields (stage,
 * serviceDescription, desiredDeadline, pricingNotes, internalNotes, plus
 * the denormalized contact fields). DELETE requires ?confirm=delete and
 * hard-removes the row — the source Booking survives.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { isAuthed } from '@/lib/admin/auth';
import { log } from '@/lib/log/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const StageEnum = z.enum(['PROSPECT', 'ACTIVE', 'DELIVERED', 'CHURNED']);

const PatchBody = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().toLowerCase().email().max(254).optional(),
  company: z.string().trim().max(160).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  serviceDescription: z.string().max(4000).optional(),
  desiredDeadline: z.string().datetime().nullable().optional(),
  pricingNotes: z.string().max(2000).nullable().optional(),
  internalNotes: z.string().max(10000).nullable().optional(),
  stage: StageEnum.optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const raw = await req.json().catch(() => null);
  const parsed = PatchBody.safeParse(raw);
  if (!parsed.success) {
    // Log the structured schema error server-side (request-id ties it to the
    // route log line) but return only a generic message to the caller. Leaking
    // `issues` would hand attackers a free map of admin-edit validation rules.
    log('warn', 'admin.customers.patch.invalid_payload', {
      customerId: id,
      issues: parsed.error.issues,
    });
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }
  const existing = await prisma.customer.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const data: Record<string, unknown> = {};
  const p = parsed.data;
  if (p.name !== undefined) data.name = p.name;
  if (p.email !== undefined) data.email = p.email;
  if (p.company !== undefined) data.company = p.company;
  if (p.phone !== undefined) data.phone = p.phone;
  if (p.serviceDescription !== undefined) data.serviceDescription = p.serviceDescription;
  if (p.desiredDeadline !== undefined)
    data.desiredDeadline = p.desiredDeadline ? new Date(p.desiredDeadline) : null;
  if (p.pricingNotes !== undefined) data.pricingNotes = p.pricingNotes;
  if (p.internalNotes !== undefined) data.internalNotes = p.internalNotes;
  if (p.stage !== undefined) data.stage = p.stage;

  const updated = await prisma.customer.update({ where: { id }, data });

  return NextResponse.json({
    customer: {
      ...updated,
      desiredDeadline: updated.desiredDeadline ? updated.desiredDeadline.toISOString() : null,
      promotedAt: updated.promotedAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}

export async function DELETE(
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
  const existing = await prisma.customer.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
