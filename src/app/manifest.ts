import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BusinessDawg',
    short_name: 'BusinessDawg',
    description:
      'A Gen Z–native business growth system studio. Branding, AI, web, and growth systems for founders who actually ship.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#0A0A0A',
    icons: [
      { src: '/brand/logo-mark.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/logo-mark.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
