import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const ONE_YEAR = 60 * 60 * 24 * 365;

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    // Next's first-party named-import tree-shake transform. Strips unused
    // framer-motion / lenis internals (~30–40 KB) from client bundles.
    optimizePackageImports: ['framer-motion', 'lenis'],
  },
  images: {
    // Hostinger's Node runtime can't reliably run /_next/image (sharp missing
    // or wrong-arch → 503s). Every WebP in /public is already hand-tuned and
    // right-sized, so we serve them directly as <img src> instead.
    unoptimized: true,
  },
  async headers() {
    const immutable = [
      {
        key: 'Cache-Control',
        value: `public, max-age=${ONE_YEAR}, immutable`,
      },
    ];
    const noStore = [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }];

    // Baseline security headers applied to every response. CSP is intentionally
    // omitted for now — Next App Router uses inline styles from framer-motion
    // and an inline first-touch attribution script in layout.tsx, so a correct
    // CSP requires a nonce strategy. Tracked as a follow-up; the headers below
    // are the low-risk wins.
    const securityHeaders = [
      // Clickjacking. We don't intentionally embed any page of the site in an
      // iframe; DENY is correct (SAMEORIGIN would only matter if we embedded
      // ourselves, which we don't).
      { key: 'X-Frame-Options', value: 'DENY' },
      // Stop browsers from guessing content types and executing things like
      // image/* as scripts.
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Send origin only for cross-origin navigations. Keeps full URL on
      // same-origin so PostHog/Sentry pageview attribution stays accurate.
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // Deny powerful features we don't use anywhere. Killing the surface
      // means a future XSS can't silently turn on the user's camera or geo.
      {
        key: 'Permissions-Policy',
        value: [
          'camera=()',
          'microphone=()',
          'geolocation=()',
          'payment=()',
          'usb=()',
          'interest-cohort=()',
        ].join(', '),
      },
      // HSTS only in production. On localhost (HTTP) the browser would still
      // cache this and refuse plain http on the dev host, which is annoying.
      ...(process.env.NODE_ENV === 'production'
        ? [
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains; preload',
            },
          ]
        : []),
      // No cross-origin window opener leaks.
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    ];

    return [
      // Static assets — long-cache, immutable
      { source: '/brand/:path*', headers: immutable },
      { source: '/:all*(svg|webp|avif|jpg|jpeg|png|ico|woff|woff2)', headers: immutable },
      // HTML pages — never cache at the edge. If nginx ever caches an HTML
      // response that references build-hash chunks, a later redeploy makes
      // those chunks 404 → unstyled page. no-store kills that whole failure mode.
      { source: '/((?!_next/|brand/|api/).*)', headers: noStore },
      // Security headers on everything.
      { source: '/:path*', headers: securityHeaders },
    ];
  },
};

// Wrap with Sentry's Next plugin so production builds upload source maps
// (Sentry resolves minified stack traces back to TypeScript) and instrument
// API routes for tracing. The wrapper is a no-op when SENTRY_AUTH_TOKEN is
// absent, so local builds keep working without Sentry creds.
export default withSentryConfig(nextConfig, {
  // Org + project come from .env.local (SENTRY_ORG, SENTRY_PROJECT) — passing
  // them via env keeps the values out of source control.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Suppress Sentry's own build chatter unless we're in CI.
  silent: !process.env.CI,
  // Don't fail the Hostinger build if Sentry source-map upload errors out
  // (network blip, expired auth token, etc.) — site keeps deploying, we just
  // lose source maps for that release.
  errorHandler: (err) => {
    console.warn('[sentry] source-map upload failed (continuing build):', err.message);
  },
  // Trim the JS bundle by removing Sentry SDK logger statements from prod
  // client builds. Saves ~5–10 KB.
  disableLogger: true,
  // Sentry tunnels client requests through a Next route to bypass ad-blockers
  // that block requests to ingest.sentry.io. Cheap (just a rewrite) and means
  // we don't lose visibility on users with uBlock installed.
  tunnelRoute: '/monitoring',
});
