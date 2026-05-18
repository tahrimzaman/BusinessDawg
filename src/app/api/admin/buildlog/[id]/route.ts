/**
 * Admin-gated build log per-entry mutations.
 *
 * PATCH  → update any subset of fields. Re-slugifies if a new slug is passed.
 * DELETE → hard delete (first-party content; no soft-delete needed).
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { isAuthed } from '@/lib/admin/auth';
import { withLogging } from '@/lib/log/route';
import { slugify } from '@/lib/buildlog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UpdatePayload = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    slug: z.string().trim().max(80).optional(),
    date: z.string().datetime({ offset: true }).optional(),
    body: z.string().trim().min(1).max(20_000).optional(),
    imageUrl: z.string().trim().url().max(500).optional().or(z.literal('')),
    imageAlt: z.string().trim().max(200).optional().or(z.literal('')),
    loomUrl: z.string().trim().max(500).optional().or(z.literal('')),
    published: z.boolean().optional(),
  })
  .strict();

type Ctx = { params: Promise<{ id: string }> };

async function handlePATCH(req: Request, ctx: Ctx) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const raw = await req.json().catch(() => null);
  const parsed = UpdatePayload.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const data: Prisma.BuildLogEntryUpdateInput = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.slug !== undefined) {
    const normalized = slugify(parsed.data.slug);
    if (!normalized) {
      return NextResponse.json({ error: 'slug empty after normalization' }, { status: 400 });
    }
    data.slug = normalized;
  }
  if (parsed.data.date !== undefined) data.date = new Date(parsed.data.date);
  if (parsed.data.body !== undefined) data.body = parsed.data.body;
  if (parsed.data.imageUrl !== undefined) data.imageUrl = parsed.data.imageUrl || null;
  if (parsed.data.imageAlt !== undefined) data.imageAlt = parsed.data.imageAlt || null;
  if (parsed.data.loomUrl !== undefined) data.loomUrl = parsed.data.loomUrl || null;
  if (parsed.data.published !== undefined) data.published = parsed.data.published;

  try {
    const row = await prisma.buildLogEntry.update({ where: { id }, data });
    return NextResponse.json({
      id: row.id,
      slug: row.slug,
      title: row.title,
      date: row.date.toISOString(),
      body: row.body,
      imageUrl: row.imageUrl,
      imageAlt: row.imageAlt,
      loomUrl: row.loomUrl,
      published: row.published,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return NextResponse.json({ error: 'slug taken' }, { status: 409 });
      }
      if (err.code === 'P2025') {
        return NextResponse.json({ error: 'not found' }, { status: 404 });
      }
    }
    console.error('[/api/admin/buildlog/:id] update error', err);
    return NextResponse.json({ error: 'persistence failed' }, { status: 500 });
  }
}

async function handleDELETE(_req: Request, ctx: Ctx) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.buildLogEntry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    console.error('[/api/admin/buildlog/:id] delete error', err);
    return NextResponse.json({ error: 'delete failed' }, { status: 500 });
  }
}

export const PATCH = withLogging('admin.buildlog.update', handlePATCH);
export const DELETE = withLogging('admin.buildlog.delete', handleDELETE);
