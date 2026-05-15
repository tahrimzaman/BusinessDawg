import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/admin/auth';
import { prisma } from '@/lib/db/prisma';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';

async function handleGET(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get('type');

  // Cap export size to protect memory + response time as the table grows. If we
  // ever need a full snapshot we'll add pagination via ?cursor= or a one-off
  // backend export — the admin UI never needs more than this in a single click.
  const EXPORT_LIMIT = 10_000;

  if (type === 'subscribers') {
    const rows = await prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
      take: EXPORT_LIMIT,
    });
    const csv = toCsv(
      ['createdAt', 'email', 'source'],
      rows.map((r) => [r.createdAt.toISOString(), r.email, r.source]),
    );
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="subscribers-${stamp()}.csv"`,
      },
    });
  }

  if (type === 'applications') {
    const rows = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      take: EXPORT_LIMIT,
    });
    const csv = toCsv(
      ['createdAt', 'name', 'email', 'role', 'portfolio', 'note'],
      rows.map((r) => [
        r.createdAt.toISOString(),
        r.name,
        r.email,
        r.role || '',
        r.portfolio || '',
        (r.note || '').replace(/\n/g, ' '),
      ]),
    );
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="applications-${stamp()}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: 'unknown type' }, { status: 400 });
}

function toCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
}

function stamp(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

export const GET = withLogging('admin.export', handleGET);
