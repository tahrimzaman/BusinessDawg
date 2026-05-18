import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { JOURNAL } from '@/lib/journal';

const description =
  'Field notes from BusinessDawg — operator-level essays on growth systems, AI automation, branding, and shipping. Written by founder Tahrim Zaman.';

export const metadata = {
  title: 'Journal',
  description,
  alternates: { canonical: '/journal' },
  openGraph: {
    title: 'Journal — BusinessDawg',
    description,
    url: 'https://businessdawg.com/journal',
    type: 'website' as const,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Journal — BusinessDawg',
    description,
  },
};

const dateFmt = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export default function JournalIndex() {
  const posts = [...JOURNAL].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 pt-28 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://businessdawg.com' },
          { name: 'Journal', url: 'https://businessdawg.com/journal' },
        ]}
      />
      <Reveal>
        <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
          / Journal
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="font-display mt-3 max-w-4xl text-4xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
          Field notes from building business machines.
        </h1>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mt-6 max-w-2xl text-lg text-[color:var(--bd-bone)]/70">
          Essays on growth systems, AI automation, branding, and the operator&rsquo;s side of
          shipping. Written by Tahrim, founder of BusinessDawg.
        </p>
      </Reveal>
      <div className="mt-12 grid gap-5">
        {posts.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.04}>
            <Link
              href={`/journal/${p.slug}`}
              className="group flex items-start justify-between gap-8 rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-8 transition-colors hover:border-[color:var(--bd-lime)]/40 md:p-10"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3 font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
                  <span>{dateFmt.format(new Date(p.publishedAt))}</span>
                  <span aria-hidden>·</span>
                  <span>{p.readingTime} min read</span>
                </div>
                <h2 className="font-display mt-3 text-2xl font-bold italic md:text-4xl">
                  {p.title}
                </h2>
                <p className="mt-3 max-w-2xl text-[color:var(--bd-bone)]/70">{p.excerpt}</p>
              </div>
              <span className="hidden text-sm font-semibold text-[color:var(--bd-bone)]/70 group-hover:text-[color:var(--bd-lime)] md:inline">
                Read →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
