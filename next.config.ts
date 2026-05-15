import type { NextConfig } from 'next';

const ONE_YEAR = 60 * 60 * 24 * 365;

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    minimumCacheTTL: ONE_YEAR,
  },
  async headers() {
    const immutable = [
      {
        key: 'Cache-Control',
        value: `public, max-age=${ONE_YEAR}, immutable`,
      },
    ];
    return [
      { source: '/brand/:path*', headers: immutable },
      { source: '/:all*(svg|webp|avif|jpg|jpeg|png|ico|woff|woff2)', headers: immutable },
    ];
  },
};

export default nextConfig;
