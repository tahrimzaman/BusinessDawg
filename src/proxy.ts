/**
 * Edge proxy — two concerns:
 *
 * 1. Stamp `x-request-id` on every `/api/*` request so server-side route
 *    handlers can correlate logs across the whole API surface. If a caller
 *    already sends an `x-request-id`, we honor it.
 *
 * 2. Defense-in-depth admin auth for `/api/admin/*`. Every admin route
 *    handler still calls `isAuthed()` inline (one-line guard), but adding
 *    the perimeter check here means a future route added without that guard
 *    fails closed instead of silently exposing data.
 *
 * Why only `/api/*`: pages are mostly static (`force-static` on /) and don't
 * benefit from per-request correlation. Edge code runs on every match —
 * keep its scope as narrow as the value it adds.
 *
 * Why Web Crypto (not node:crypto): proxy runs on Edge by default. The
 * isAuthed() helper in @/lib/admin/auth uses node:crypto.timingSafeEqual,
 * which isn't available here. We mirror its semantics with SubtleCrypto +
 * a constant-time string compare. Source of truth for the cookie shape
 * stays in `@/lib/admin/auth` — keep this in sync if you change that file.
 *
 * Naming: Next 16 renamed the `middleware.ts` file convention to `proxy.ts`
 * and the exported function from `middleware()` to `proxy()`. Same semantics,
 * new names.
 */

import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE = 'bd_admin';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Defense-in-depth CSRF on admin mutation requests. The admin cookie is
 * SameSite=Strict which kills most CSRF; this Origin/Referer check closes
 * the gap on legacy browsers + WebView quirks. Skip safe methods (GET/HEAD).
 *
 * Allowed origins: BOOKING_BASE_URL / NEXT_PUBLIC_SITE_URL / businessdawg.com,
 * plus localhost in dev. Anything else gets 403.
 */
function allowedOrigins(): Set<string> {
  const out = new Set<string>();
  const candidates = [
    process.env.BOOKING_BASE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    'https://businessdawg.com',
  ];
  for (const c of candidates) {
    if (!c) continue;
    try {
      out.add(new URL(c).origin);
    } catch {
      /* ignore malformed env */
    }
  }
  if (process.env.NODE_ENV !== 'production') {
    out.add('http://localhost:3000');
    out.add('http://127.0.0.1:3000');
  }
  return out;
}

function csrfReject(req: NextRequest, requestId: string): NextResponse | null {
  if (!MUTATING_METHODS.has(req.method)) return null;
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const candidate = origin || referer;
  const fail = (reason: string) => {
    const res = NextResponse.json({ error: 'forbidden', reason }, { status: 403 });
    res.headers.set('x-request-id', requestId);
    return res;
  };
  if (!candidate) return fail('missing-origin');
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return fail('bad-origin');
  }
  if (!allowedOrigins().has(parsed.origin)) return fail('cross-origin');
  return null;
}

async function isAuthedEdge(req: NextRequest): Promise<boolean> {
  const pw = process.env.ADMIN_PASSWORD;
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    (process.env.NODE_ENV !== 'production' ? 'change-me-in-production-DEV-ONLY' : null);
  if (!pw || !secret) return false;
  const got = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!got) return false;
  const data = new TextEncoder().encode(`${pw}:${secret}`);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  const expected = Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  if (expected.length !== got.length) return false;
  // Constant-time compare — never short-circuit on first mismatch.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ got.charCodeAt(i);
  }
  return diff === 0;
}

export async function proxy(req: NextRequest) {
  const existing = req.headers.get('x-request-id');
  const requestId = existing || crypto.randomUUID();

  // Forward the header to the underlying route handler.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', requestId);

  // CSRF check runs before the auth check so a stolen cookie used from a
  // cross-origin context is still rejected (defense in depth on top of
  // SameSite=Strict). Applies to every admin route including /login —
  // login CSRF would let an attacker pin a victim to a known admin session.
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith('/api/admin/')) {
    const rejected = csrfReject(req, requestId);
    if (rejected) return rejected;
  }

  // Admin perimeter check. /api/admin/login is the only exemption — it's the
  // endpoint that creates the session, so the caller can't be authed yet.
  if (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/login')) {
    if (!(await isAuthedEdge(req))) {
      const res = NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      res.headers.set('x-request-id', requestId);
      return res;
    }
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  // Echo back so clients can use it when filing bugs.
  res.headers.set('x-request-id', requestId);
  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};
