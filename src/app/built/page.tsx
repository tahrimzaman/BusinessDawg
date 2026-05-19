/**
 * Public build log index — `/built`.
 *
 * Renders all *published* entries newest-first, grouped by month so a slow
 * week doesn't visually penalize a single day. Reads live from the DB on every
 * request (force-dynamic) so admin publish-toggle changes show up instantly.
 *
 * Mirrors the visual language of /journal so the page feels native — same
 * typography rhythm, same lime kicker, same Reveal motion.
 */

import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { prisma } from '@/lib/db/prisma';
import { excerpt, groupByMonth, type BuildLogEntryRow } from '@/lib/buildlog';
import BuildLogSubscribe from '@/components/sections/BuildLogSubscribe';

export const dynamic = 'force-dynamic';

const description =
  'What BusinessDawg is shipping, week by week. Real updates from a working studio — features, fixes, experiments, and the occasional postmortem.';

export const metadata = {
  title: 'Built — what we ship, week by week',
  description,
  alternates: { canonical: '/built' },
  openGraph: {
    title: 'Built — BusinessDawg',
    description,
    url: 'https://businessdawg.com/built',
    type: 'website' as const,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Built — BusinessDawg',
    description,
  },
};

const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

export default async function BuiltIndex() {
  const rows = await prisma.buildLogEntry.findMany({
    where: { published: true },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    take: 500,
  });
  const entries: BuildLogEntryRow[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    date: r.date.toISOString(),
    body: r.body,
    imageUrl: r.imageUrl,
    imageAlt: r.imageAlt,
    loomUrl: r.loomUrl,
    published: r.published,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
  const months = groupByMonth(entries);

  return (
    <div className="mx-auto max-w-7xl px-6 pt-28 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://businessdawg.com' },
          { name: 'Built', url: 'https://businessdawg.com/built' },
        ]}
      />

      <Reveal>
        <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
          / Built
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="font-display mt-3 max-w-4xl text-4xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
          What we&rsquo;re shipping, week by week.
        </h1>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mt-6 max-w-2xl text-lg text-[color:var(--bd-bone)]/70">
          Real updates from a working studio. Features we shipped, bugs we killed, experiments we
          ran. No filler. No quarterly recap decks. Just what landed.
        </p>
      </Reveal>

      {months.length === 0 ? (
        <Reveal delay={0.15}>
          <div className="mt-16 rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-10 text-center">
            <p className="font-display text-2xl font-bold italic">First entry lands soon.</p>
            <p className="mt-3 text-[color:var(--bd-bone)]/70">
              Check back in a few days, or subscribe below so we can ping you when it does.
            </p>
          </div>
        </Reveal>
      ) : (
        <div className="mt-14 space-y-14">
          {months.map((m) => (
            <section key={m.monthKey}>
              <Reveal>
                <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
                  / {m.label}
                </p>
              </Reveal>
              <div className="mt-5 grid gap-5">
                {m.entries.map((p, i) => (
                  <Reveal key={p.id} delay={i * 0.04}>
                    <Link
                      href={`/built/${p.slug}`}
                      className="group flex items-start gap-6 rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-6 transition-colors hover:border-[color:var(--bd-lime)]/40 md:p-8"
                    >
                      {p.imageUrl && (
                        <div className="hidden flex-none overflow-hidden rounded-2xl border border-white/10 md:block">
                          {/* Use plain <img> so any public host works without
                              needing a Next remotePatterns whitelist entry. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.imageUrl}
                            alt={p.imageAlt || p.title}
                            width={140}
                            height={88}
                            loading="lazy"
                            className="h-22 w-36 object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3 font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
                          <span>{dateFmt.format(new Date(p.date))}</span>
                          {p.loomUrl && (
                            <>
                              <span aria-hidden>·</span>
                              <span>Loom inside</span>
                            </>
                          )}
                        </div>
                        <h2 className="font-display mt-2 text-xl font-bold italic md:text-2xl">
                          {p.title}
                        </h2>
                        <p className="mt-2 max-w-3xl text-[color:var(--bd-bone)]/70">
                          {excerpt(p.body, 220)}
                        </p>
                      </div>
                      <span className="hidden text-sm font-semibold text-[color:var(--bd-bone)]/70 group-hover:text-[color:var(--bd-lime)] md:inline">
                        Read →
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <BuildLogSubscribe />
    </div>
  );
}
