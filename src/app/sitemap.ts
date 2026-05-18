import type { MetadataRoute } from 'next';
import { SYSTEMS } from '@/lib/copy';
import { JOURNAL } from '@/lib/journal';
import { prisma } from '@/lib/db/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://businessdawg.com';
  const lastModified = new Date();
  const fixed = [
    '',
    '/systems',
    '/about',
    '/faq',
    '/join',
    '/contact',
    '/journal',
    '/pricing',
    '/built',
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified,
  }));
  const systems = SYSTEMS.map((s) => ({ url: `${base}/systems/${s.slug}`, lastModified }));
  const posts = JOURNAL.map((p) => ({
    url: `${base}/journal/${p.slug}`,
    lastModified: new Date(p.publishedAt),
  }));
  // Pull published build log entries — gracefully degrade if the DB is
  // unreachable at build time so a flaky DB never blocks a deploy.
  let builtEntries: MetadataRoute.Sitemap = [];
  try {
    const rows = await prisma.buildLogEntry.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      take: 500,
    });
    builtEntries = rows.map((r) => ({
      url: `${base}/built/${r.slug}`,
      lastModified: r.updatedAt,
    }));
  } catch (err) {
    console.error('[sitemap] build log fetch failed', err);
  }
  return [...fixed, ...systems, ...posts, ...builtEntries];
}
