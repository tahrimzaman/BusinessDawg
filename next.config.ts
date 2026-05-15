import type { NextConfig } from 'next';

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
    return [
      // Static assets — long-cache, immutable
      { source: '/brand/:path*', headers: immutable },
      { source: '/:all*(svg|webp|avif|jpg|jpeg|png|ico|woff|woff2)', headers: immutable },
      // HTML pages — never cache at the edge. If nginx ever caches an HTML
      // response that references build-hash chunks, a later redeploy makes
      // those chunks 404 → unstyled page. no-store kills that whole failure mode.
      { source: '/((?!_next/|brand/|api/).*)', headers: noStore },
    ];
  },
};

export default nextConfig;
