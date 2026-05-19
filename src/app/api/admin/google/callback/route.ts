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

/**
 * Build a redirect URL using the public host from proxy headers, not the
 * request URL. On Hostinger the Node process binds to `0.0.0.0:3000` and
 * the public hostname only arrives via `x-forwarded-host` / `host` headers
 * — using `req.url` as the base sends the user to `https://0.0.0.0:3000/...`.
 * Mirrors the same pattern used in `src/app/booking/[token]/manage/page.tsx`.
 */
function publicRedirect(req: Request, path: string): NextResponse {
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'localhost:3000';
  const proto =
    req.headers.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return NextResponse.redirect(new URL(path, `${proto}://${host}`));
}

async function handleGET(req: Request) {
  if (!(await isAuthed())) {
    return publicRedirect(req, '/admin/login');
  }
  const env = getGoogleEnv();
  if (!env) {
    return publicRedirect(req, '/admin?google=not_configured');
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const oauthError = url.searchParams.get('error');
  if (oauthError) {
    return publicRedirect(req, `/admin?google=${oauthError}`);
  }
  if (!code) {
    return publicRedirect(req, '/admin?google=missing_code');
  }

  try {
    const { tokens, email } = await exchangeCode(env, code);
    if (!tokens.refresh_token) {
      // Re-auth without revoking first sometimes omits the refresh token.
      // Tell the admin so they can revoke + retry.
      return publicRedirect(req, '/admin?google=no_refresh_token');
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
    return publicRedirect(req, '/admin?google=connected');
  } catch (err) {
    console.error('[google/callback] exchange failed', err);
    return publicRedirect(req, '/admin?google=exchange_failed');
  }
}

export const GET = withLogging('admin.google.callback', handleGET);
