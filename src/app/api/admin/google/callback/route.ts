/**
 * GET /api/admin/google/callback — OAuth callback. Exchanges the code for
 * tokens, persists them on the GoogleToken singleton (refresh token is the
 * critical one — without it we can't mint future access tokens), then
 * redirects back to /admin with a status hash.
 */

import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/admin/auth';
import { prisma } from '@/lib/db/prisma';
import { getGoogleEnv, exchangeCode } from '@/lib/booking/google';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handleGET(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  const env = getGoogleEnv();
  if (!env) {
    return NextResponse.redirect(new URL('/admin?google=not_configured', req.url));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const oauthError = url.searchParams.get('error');
  if (oauthError) {
    return NextResponse.redirect(new URL(`/admin?google=${oauthError}`, req.url));
  }
  if (!code) {
    return NextResponse.redirect(new URL('/admin?google=missing_code', req.url));
  }

  try {
    const { tokens, email } = await exchangeCode(env, code);
    if (!tokens.refresh_token) {
      // Re-auth without revoking first sometimes omits the refresh token.
      // Tell the admin so they can revoke + retry.
      return NextResponse.redirect(new URL('/admin?google=no_refresh_token', req.url));
    }
    await prisma.googleToken.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token ?? null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope ?? '',
        ownerEmail: email,
        lastRefreshAt: new Date(),
      },
      update: {
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token ?? null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope ?? '',
        ownerEmail: email,
        lastRefreshAt: new Date(),
      },
    });
    return NextResponse.redirect(new URL('/admin?google=connected', req.url));
  } catch (err) {
    console.error('[google/callback] exchange failed', err);
    return NextResponse.redirect(new URL('/admin?google=exchange_failed', req.url));
  }
}

export const GET = withLogging('admin.google.callback', handleGET);
