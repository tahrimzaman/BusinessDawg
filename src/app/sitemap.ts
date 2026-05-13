import type { MetadataRoute } from 'next';
import { SYSTEMS } from '@/lib/copy';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://businessdawg.com';
  const lastModified = new Date();
  const fixed = ['', '/systems', '/about', '/join', '/contact'].map((p) => ({
    url: `${base}${p}`,
    lastModified,
  }));
  const systems = SYSTEMS.map((s) => ({ url: `${base}/systems/${s.slug}`, lastModified }));
  return [...fixed, ...systems];
}
