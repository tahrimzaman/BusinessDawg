import type { MetadataRoute } from 'next';
import { SYSTEMS, WORK_CONCEPTS, BUILT } from '@/lib/copy';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://businessdawg.com';
  const lastModified = new Date();
  const fixed = ['', '/systems', '/work', '/built', '/about', '/join', '/contact'].map((p) => ({
    url: `${base}${p}`,
    lastModified,
  }));
  const systems = SYSTEMS.map((s) => ({ url: `${base}/systems/${s.slug}`, lastModified }));
  const work = WORK_CONCEPTS.map((w) => ({ url: `${base}/work/${w.slug}`, lastModified }));
  const built = BUILT.map((b) => ({ url: `${base}/built/${b.slug}`, lastModified }));
  return [...fixed, ...systems, ...work, ...built];
}
