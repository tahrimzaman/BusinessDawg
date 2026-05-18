/**
 * GET /api/admin/traffic?window=today|30d|all
 *
 * Powers the window-toggle on the admin Traffic tab. Returns the same
 * `TrafficData` shape used in the initial server render so the client can
 * just drop it into state.
 *
 * Auth: requires admin session. Returns 401 otherwise so a stray scraper
 * can't pull PostHog data through this endpoint.
 */

import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/admin/auth';
import { getTrafficData } from '@/lib/admin/traffic';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const url = new URL(req.url);
  const w = url.searchParams.get('window');
  const window = w === 'today' || w === 'all' ? w : '30d';
  const data = await getTrafficData(window);
  return NextResponse.json(data);
}

export const GET = withLogging('admin.traffic', handler);
