/**
 * Public build log entry detail page — `/built/[slug]`.
 *
 * Renders a single published entry: title, date, optional image, optional
 * Loom embed, body paragraphs, prev/next navigation, and a Book-a-Call CTA
 * matching the journal page footer.
 *
 * Markdown is intentionally not parsed via a library — body content is short
 * (2–4 sentences typical) and we just split on blank lines for paragraphs.
 * Links/images that need to render get pasted as their own image/Loom fields
 * in the admin form, not inline in the body.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { prisma } from '@/lib/db/prisma';
import { excerpt, loomEmbedUrl } from '@/lib/buildlog';

export const dynamic = 'force-dynamic';

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.buildLogEntry.findUnique({ where: { slug } });
  if (!post || !post.published) return { title: 'Build log' };
  const url = `https://businessdawg.com/built/${post.slug}`;
  const desc = excerpt(post.body, 155);
  return {
    title: post.title,
    description: desc,
    alternates: { canonical: `/built/${post.slug}` },
    openGraph: {
      title: `${post.title} · BusinessDawg build log`,
      description: desc,
      url,
      type: 'article',
      publishedTime: post.date.toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} · BusinessDawg build log`,
      description: desc,
    },
  };
}

const dateFmt = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export default async function BuildLogEntryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await prisma.buildLogEntry.findUnique({ where: { slug } });
  if (!post || !post.published) notFound();

  // Pull all published siblings to compute prev/next. Bounded at 500 by the
  // admin write path; the cost is negligible.
  const siblings = await prisma.buildLogEntry.findMany({
    where: { published: true },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    select: { slug: true, title: true },
  });
  const idx = siblings.findIndex((s) => s.slug === slug);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const url = `https://businessdawg.com/built/${post.slug}`;
  const embed = loomEmbedUrl(post.loomUrl);
  const paragraphs = post.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <ArticleJsonLd
        headline={post.title}
        description={excerpt(post.body, 155)}
        url={url}
        datePublished={post.date.toISOString()}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://businessdawg.com' },
          { name: 'Built', url: 'https://businessdawg.com/built' },
          { name: post.title, url },
        ]}
      />
      <article className="mx-auto max-w-3xl px-6 pt-28 pb-16">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / Build log
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display mt-4 text-4xl leading-[1.05] font-extrabold tracking-tight italic sm:text-5xl md:text-6xl">
            {post.title}
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
            <span>{dateFmt.format(post.date)}</span>
            <span aria-hidden>·</span>
            <span>By Tahrim Zaman</span>
          </div>
        </Reveal>

        {post.imageUrl && (
          <Reveal delay={0.15}>
            <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-black/40">
              {/* Plain <img>: pasted URLs come from arbitrary public hosts
                  (imgur, imgbb, Twitter). next/image would require maintaining
                  a remotePatterns allowlist for every one. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageUrl}
                alt={post.imageAlt || post.title}
                className="h-auto w-full"
              />
            </div>
          </Reveal>
        )}

        {embed && (
          <Reveal delay={0.18}>
            <div className="mt-10 aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black/60">
              <iframe
                src={embed}
                title={`${post.title} · Loom`}
                allow="fullscreen"
                loading="lazy"
                className="h-full w-full"
              />
            </div>
          </Reveal>
        )}

        <div className="mt-10 space-y-5 text-lg leading-relaxed text-[color:var(--bd-bone)]/85">
          {paragraphs.map((p, i) => (
            <Reveal key={i} delay={0.04 * (i + 1)}>
              <p className="whitespace-pre-wrap">{p}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.05}>
          <div className="mt-14 rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-8 md:p-10">
            <p className="font-display text-2xl font-bold italic md:text-3xl">
              Got something you want us to build?
            </p>
            <p className="mt-3 max-w-xl text-[color:var(--bd-bone)]/70">
              30 minutes, no decks. Tell us what&rsquo;s leaking and we&rsquo;ll tell you what to do
              about it.
            </p>
            <div className="mt-6">
              <MagneticButton href="/contact">Book a call →</MagneticButton>
            </div>
          </div>
        </Reveal>

        {(prev || next) && (
          <Reveal delay={0.05}>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {prev ? (
                <Link
                  href={`/built/${prev.slug}`}
                  className="group block rounded-2xl border border-white/8 bg-[color:var(--bd-smoke)] p-6 transition-colors hover:border-[color:var(--bd-lime)]/40"
                >
                  <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
                    ← Newer
                  </p>
                  <p className="font-display mt-2 text-lg font-bold italic">{prev.title}</p>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/built/${next.slug}`}
                  className="group block rounded-2xl border border-white/8 bg-[color:var(--bd-smoke)] p-6 transition-colors hover:border-[color:var(--bd-lime)]/40 md:text-right"
                >
                  <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
                    Older →
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
              href="/built"
              className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/60 uppercase hover:text-[color:var(--bd-lime)]"
            >
              ← Back to the log
            </Link>
          </div>
        </Reveal>
      </article>
    </>
  );
}
