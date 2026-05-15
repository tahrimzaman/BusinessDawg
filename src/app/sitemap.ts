import type { MetadataRoute } from 'next';
import { SYSTEMS } from '@/lib/copy';
import { JOURNAL } from '@/lib/journal';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://businessdawg.com';
  const lastModified = new Date();
  const fixed = ['', '/systems', '/about', '/faq', '/join', '/contact', '/journal', '/pricing'].map(
    (p) => ({
      url: `${base}${p}`,
      lastModified,
    }),
  );
  const systems = SYSTEMS.map((s) => ({ url: `${base}/systems/${s.slug}`, lastModified }));
  const posts = JOURNAL.map((p) => ({
    url: `${base}/journal/${p.slug}`,
    lastModified: new Date(p.publishedAt),
  }));
  return [...fixed, ...systems, ...posts];
}
