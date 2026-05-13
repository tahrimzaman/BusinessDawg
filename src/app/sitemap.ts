import type { MetadataRoute } from 'next';
import { SYSTEMS, BUILT } from '@/lib/copy';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://businessdawg.com';
  const lastModified = new Date();
  const fixed = ['', '/systems', '/built', '/about', '/join', '/contact'].map((p) => ({
    url: `${base}${p}`,
    lastModified,
  }));
  const systems = SYSTEMS.map((s) => ({ url: `${base}/systems/${s.slug}`, lastModified }));
  const built = BUILT.map((b) => ({ url: `${base}/built/${b.slug}`, lastModified }));
  return [...fixed, ...systems, ...built];
}
