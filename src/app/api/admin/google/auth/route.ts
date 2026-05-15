/**
 * GET /api/admin/google/auth — kicks off the OAuth consent flow. Builds the
 * Google authorize URL with `access_type=offline` + `prompt=consent` so we
 * always get a fresh refresh token, then 302s the admin over to Google.
 */

import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/admin/auth';
import { getGoogleEnv, buildAuthUrl } from '@/lib/booking/google';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handleGET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const env = getGoogleEnv();
  if (!env) {
    return NextResponse.json(
      { error: 'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not configured' },
      { status: 503 },
    );
  }
  const url = buildAuthUrl(env);
  return NextResponse.redirect(url);
}

export const GET = withLogging('admin.google.auth', handleGET);
