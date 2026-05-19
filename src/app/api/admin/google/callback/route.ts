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
import { encryptToken } from '@/lib/security/crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Build a redirect URL using the public host from proxy headers, not the
 * request URL. On Hostinger the Node process binds to `0.0.0.0:3000` and
 * the public hostname only arrives via `x-forwarded-host` / `host` headers
 * — using `req.url` as the base sends the user to `https://0.0.0.0:3000/...`.
 *
 * Host is validated against an allowlist (canonical site host + localhost)
 * so a spoofed `X-Forwarded-Host` header can't redirect the user off-site
 * after the OAuth consent screen.
 */
function canonicalHost(): string {
  try {
    return new URL(process.env.BOOKING_BASE_URL || 'https://businessdawg.com').host;
  } catch {
    return 'businessdawg.com';
  }
}

function publicRedirect(req: Request, path: string): NextResponse {
  const canonical = canonicalHost();
  const rawHost = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '';
  const allow = new Set([canonical, 'localhost:3000', '127.0.0.1:3000']);
  const host = allow.has(rawHost) ? rawHost : canonical;
  const proto =
    req.headers.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return NextResponse.redirect(new URL(path, `${proto}://${host}`));
}

// Enum of statuses the /admin page knows how to render. Anything else from
// Google (or a crafted URL) collapses to `server_error` to prevent reflecting
// attacker-controlled strings into the redirect URL.
const ALLOWED_STATUSES = new Set([
  'connected',
  'not_configured',
  'missing_code',
  'no_refresh_token',
  'exchange_failed',
  'access_denied',
  'invalid_state',
  'server_error',
]);

function statusRedirect(req: Request, status: string): NextResponse {
  const safe = ALLOWED_STATUSES.has(status) ? status : 'server_error';
  return publicRedirect(req, `/admin?google=${safe}`);
}

async function handleGET(req: Request) {
  if (!(await isAuthed())) {
    return publicRedirect(req, '/admin/login');
  }
  const env = getGoogleEnv();
  if (!env) {
    return statusRedirect(req, 'not_configured');
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const oauthError = url.searchParams.get('error');
  if (oauthError) {
    // Google's documented errors include `access_denied`. Anything else is
    // coerced to `server_error` inside statusRedirect.
    return statusRedirect(req, oauthError);
  }
  if (!code) {
    return statusRedirect(req, 'missing_code');
  }

  try {
    const { tokens, email } = await exchangeCode(env, code);
    if (!tokens.refresh_token) {
      // Re-auth without revoking first sometimes omits the refresh token.
      // Tell the admin so they can revoke + retry.
      return statusRedirect(req, 'no_refresh_token');
    }
    const encRefresh = encryptToken(tokens.refresh_token);
    const encAccess = tokens.access_token ? encryptToken(tokens.access_token) : null;
    await prisma.googleToken.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        refreshToken: encRefresh,
        accessToken: encAccess,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope ?? '',
        ownerEmail: email,
        lastRefreshAt: new Date(),
      },
      update: {
        refreshToken: encRefresh,
        accessToken: encAccess,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope ?? '',
        ownerEmail: email,
        lastRefreshAt: new Date(),
      },
    });
    return statusRedirect(req, 'connected');
  } catch (err) {
    console.error('[google/callback] exchange failed', err);
    return statusRedirect(req, 'exchange_failed');
  }
}

export const GET = withLogging('admin.google.callback', handleGET);
