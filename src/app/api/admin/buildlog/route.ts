/**
 * Admin-gated build log CRUD (list + create).
 *
 * GET  → all entries (drafts + published), newest first, for the admin table.
 * POST → create a new entry. Auto-slugifies the title if `slug` is omitted.
 *        Returns 409 on slug collision so the form can surface a friendly
 *        "slug taken — try a different title" instead of a generic 500.
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

const CreatePayload = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(80).optional(),
  date: z.string().datetime({ offset: true }).optional(),
  body: z.string().trim().min(1).max(20_000),
  imageUrl: z.string().trim().url().max(500).optional().or(z.literal('')),
  imageAlt: z.string().trim().max(200).optional().or(z.literal('')),
  loomUrl: z.string().trim().max(500).optional().or(z.literal('')),
  published: z.boolean().optional(),
});

async function handleGET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const rows = await prisma.buildLogEntry.findMany({
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    take: 500,
  });
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      date: r.date.toISOString(),
      body: r.body,
      imageUrl: r.imageUrl,
      imageAlt: r.imageAlt,
      loomUrl: r.loomUrl,
      published: r.published,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
  );
}

async function handlePOST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const raw = await req.json().catch(() => null);
  const parsed = CreatePayload.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // Auto-slug from title when omitted; validate manual slugs too.
  const rawSlug = parsed.data.slug?.trim() || slugify(parsed.data.title);
  const slug = slugify(rawSlug);
  if (!slug) {
    return NextResponse.json({ error: 'slug empty after normalization' }, { status: 400 });
  }

  try {
    const row = await prisma.buildLogEntry.create({
      data: {
        slug,
        title: parsed.data.title,
        date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
        body: parsed.data.body,
        imageUrl: parsed.data.imageUrl || null,
        imageAlt: parsed.data.imageAlt || null,
        loomUrl: parsed.data.loomUrl || null,
        published: parsed.data.published ?? false,
      },
    });
    return NextResponse.json(
      {
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
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'slug taken' }, { status: 409 });
    }
    console.error('[/api/admin/buildlog] create error', err);
    return NextResponse.json({ error: 'persistence failed' }, { status: 500 });
  }
}

export const GET = withLogging('admin.buildlog.list', handleGET);
export const POST = withLogging('admin.buildlog.create', handlePOST);
