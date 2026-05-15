/**
 * Edge proxy — currently only used to stamp `x-request-id` on every
 * incoming request so server-side route handlers can correlate logs across
 * the whole API surface.
 *
 * If a caller (e.g. curl, internal cron, frontend fetch wrapper) already
 * sends an `x-request-id`, we honor it. Otherwise we generate a fresh UUIDv4.
 *
 * Why only `/api/*`: pages are mostly static (`force-static` on /) and don't
 * benefit from per-request correlation. Edge code runs on every match —
 * keep its scope as narrow as the value it adds.
 *
 * Naming: Next 16 renamed the `middleware.ts` file convention to `proxy.ts`
 * and the exported function from `middleware()` to `proxy()`. Same semantics,
 * new names.
 */

import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const existing = req.headers.get('x-request-id');
  const requestId = existing || crypto.randomUUID();

  // Forward the header to the underlying route handler.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', requestId);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  // Echo back so clients can use it when filing bugs.
  res.headers.set('x-request-id', requestId);
  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};
