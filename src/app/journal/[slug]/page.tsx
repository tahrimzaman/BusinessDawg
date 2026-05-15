import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { JOURNAL, getPostBySlug } from '@/lib/journal';

type Params = { slug: string };

export function generateStaticParams() {
  return JOURNAL.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPostBySlug(slug);
  if (!p) return { title: 'Post' };
  const url = `https://businessdawg.com/journal/${p.slug}`;
  // Per-post OG card baked at build time by `npm run og:build` and committed
  // to /public/og/<slug>.png. Static files only — no runtime image generation
  // (Hostinger Node 22 sandbox + next/og WASM didn't get along; the static
  // approach is the robust fix).
  const ogImage = `/og/${p.slug}.png`;
  return {
    title: p.title,
    description: p.excerpt,
    alternates: { canonical: `/journal/${p.slug}` },
    openGraph: {
      title: `${p.title} — BusinessDawg`,
      description: p.excerpt,
      url,
      type: 'article',
      publishedTime: p.publishedAt,
      images: [{ url: ogImage, width: 1200, height: 630, alt: p.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${p.title} — BusinessDawg`,
      description: p.excerpt,
      images: [ogImage],
    },
  };
}

const dateFmt = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export default async function JournalPost({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const idx = JOURNAL.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? JOURNAL[idx - 1] : null;
  const next = idx < JOURNAL.length - 1 ? JOURNAL[idx + 1] : null;
  const url = `https://businessdawg.com/journal/${post.slug}`;

  return (
    <>
      <ArticleJsonLd
        headline={post.title}
        description={post.excerpt}
        url={url}
        datePublished={post.publishedAt}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://businessdawg.com' },
          { name: 'Journal', url: 'https://businessdawg.com/journal' },
          { name: post.title, url },
        ]}
      />
      <article className="mx-auto max-w-3xl px-6 pt-40 pb-24">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / {post.kicker}
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display mt-4 text-4xl leading-[1.05] font-extrabold tracking-tight italic sm:text-5xl md:text-6xl">
            {post.title}
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
            <span>{dateFmt.format(new Date(post.publishedAt))}</span>
            <span aria-hidden>·</span>
            <span>{post.readingTime} min read</span>
            <span aria-hidden>·</span>
            <span>By Tahrim Zaman</span>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-10 text-xl leading-relaxed text-[color:var(--bd-bone)]/85">
            {post.lede}
          </p>
        </Reveal>
        <div className="mt-16 space-y-14">
          {post.sections.map((s, i) => (
            <Reveal key={i} delay={0.05}>
              <section>
                <h2 className="font-display text-2xl font-bold tracking-tight italic md:text-3xl">
                  {s.heading}
                </h2>
                <div className="mt-5 space-y-5 text-lg leading-relaxed text-[color:var(--bd-bone)]/80">
                  {s.paragraphs.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
                {s.list && s.list.length > 0 && (
                  <ul className="mt-6 space-y-3 text-lg leading-relaxed text-[color:var(--bd-bone)]/80">
                    {s.list.map((item, j) => (
                      <li key={j} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-2 inline-block h-1.5 w-1.5 flex-none rounded-full bg-[color:var(--bd-lime)]"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.05}>
          <div className="mt-20 rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-8 md:p-10">
            <p className="font-display text-2xl font-bold italic md:text-3xl">
              Got a growth system to scope?
            </p>
            <p className="mt-3 max-w-xl text-[color:var(--bd-bone)]/70">
              15 minutes, no decks. Tell us what&rsquo;s leaking and we&rsquo;ll tell you what to do
              about it.
            </p>
            <div className="mt-6">
              <MagneticButton href="/contact">Book a call →</MagneticButton>
            </div>
          </div>
        </Reveal>
        {(prev || next) && (
          <Reveal delay={0.05}>
            <div className="mt-16 grid gap-4 md:grid-cols-2">
              {prev ? (
                <Link
                  href={`/journal/${prev.slug}`}
                  className="group block rounded-2xl border border-white/8 bg-[color:var(--bd-smoke)] p-6 transition-colors hover:border-[color:var(--bd-lime)]/40"
                >
                  <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
                    ← Previous
                  </p>
                  <p className="font-display mt-2 text-lg font-bold italic">{prev.title}</p>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/journal/${next.slug}`}
                  className="group block rounded-2xl border border-white/8 bg-[color:var(--bd-smoke)] p-6 transition-colors hover:border-[color:var(--bd-lime)]/40 md:text-right"
                >
                  <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
                    Next →
                  </p>
                  <p className="font-display mt-2 text-lg font-bold italic">{next.title}</p>
                </Link>
              ) : (
                <span />
              )}
            </div>
          </Reveal>
        )}
        <Reveal delay={0.05}>
          <div className="mt-12 text-center">
            <Link
              href="/journal"
              className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/60 uppercase hover:text-[color:var(--bd-lime)]"
            >
              ← Back to the journal
            </Link>
          </div>
        </Reveal>
      </article>
    </>
  );
}
