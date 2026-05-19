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
 * Cookie shape is mirrored from `@/lib/admin/auth` (HMAC-signed `payload.sig`
 * where payload = base64url(JSON.stringify({iat})), sig = HMAC-SHA256(secret,
 * payload)). Keep these two in sync.
 *
 * Naming: Next 16 renamed the `middleware.ts` file convention to `proxy.ts`
 * and the exported function from `middleware()` to `proxy()`. Same semantics,
 * new names.
 */

import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE = 'bd_admin';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

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

function base64urlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToBase64url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function isAuthedEdge(req: NextRequest): Promise<boolean> {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    (process.env.NODE_ENV !== 'production' ? 'change-me-in-production-DEV-ONLY' : null);
  if (!secret) return false;
  const got = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!got) return false;
  const dot = got.indexOf('.');
  if (dot < 1 || dot === got.length - 1) return false;
  const payload = got.slice(0, dot);
  const sig = got.slice(dot + 1);

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const expected = bytesToBase64url(new Uint8Array(sigBuf));
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  if (diff !== 0) return false;

  try {
    const json = new TextDecoder().decode(base64urlToBytes(payload));
    const parsed = JSON.parse(json) as { iat?: unknown };
    const iat = typeof parsed.iat === 'number' ? parsed.iat : 0;
    const age = Date.now() - iat;
    return Number.isFinite(age) && age >= 0 && age <= MAX_AGE_MS;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const existing = req.headers.get('x-request-id');
  const requestId = existing || crypto.randomUUID();

  // Forward the header to the underlying route handler.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', requestId);

  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith('/api/admin/')) {
    const rejected = csrfReject(req, requestId);
    if (rejected) return rejected;
  }

  // /api/admin/login is the only exemption — it creates the session.
  if (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/login')) {
    if (!(await isAuthedEdge(req))) {
      const res = NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      res.headers.set('x-request-id', requestId);
      return res;
    }
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set('x-request-id', requestId);
  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};
