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

  // Admin perimeter check. /api/admin/login is the only exemption — it's the
  // endpoint that creates the session, so the caller can't be authed yet.
  const pathname = req.nextUrl.pathname;
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
