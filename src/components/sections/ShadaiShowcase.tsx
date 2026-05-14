import Image from 'next/image';
import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';
import { BUILT } from '@/lib/copy';
import { sanityFetch } from '@/lib/sanity/client';
import { caseStudiesQuery } from '@/lib/sanity/queries';

const GALLERY = [
  {
    src: '/shadai-home.png',
    alt: 'Shadai Ghar homepage',
    caption: 'Storefront — Faridpur D2C grocery',
  },
  {
    src: '/shadai-ai.png',
    alt: 'Shadai Ghar AI shopping recommendations',
    caption: 'AI shopping recommendations',
  },
];

type SanityCaseStudy = {
  _id?: string;
  title?: string;
  slug?: string;
  liveUrl?: string;
};

/**
 * Shadai Ghar — flagship BusinessDawg build. Lives inside /about.
 * Replaces the deleted /built routes. Content lifted verbatim from the
 * old slug page so no copy is lost.
 *
 * Reads Sanity case_study docs when available; falls back to BUILT[] in
 * /src/lib/copy.ts so the section never goes blank if Sanity is empty.
 */
export default async function ShadaiShowcase() {
  const cmsDocs = await sanityFetch<SanityCaseStudy[]>(caseStudiesQuery, {}, []);
  const fallback = BUILT[0];
  const cms = cmsDocs.find((d) => d.slug === fallback.slug) ?? cmsDocs[0];
  const venture = {
    ...fallback,
    name: cms?.title || fallback.name,
    liveUrl: cms?.liveUrl || fallback.liveUrl,
  };

  return (
    <section className="relative mt-24 border-t border-white/8 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / {venture.label}
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-3 text-4xl leading-[1.02] font-extrabold tracking-tight italic sm:text-5xl md:text-6xl">
            {venture.name}.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-4 max-w-2xl text-lg text-[color:var(--bd-bone)]/70 sm:text-xl">
            {venture.tagline}
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <dl className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="border-t border-white/8 pt-4">
              <dt className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
                Role
              </dt>
              <dd className="mt-2 text-lg font-semibold">Studio — design + build</dd>
            </div>
            <div className="border-t border-white/8 pt-4">
              <dt className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
                Timeline
              </dt>
              <dd className="mt-2 text-lg font-semibold">6 weeks to traction</dd>
            </div>
            <div className="border-t border-white/8 pt-4">
              <dt className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
                Live
              </dt>
              <dd className="mt-2 text-lg font-semibold">
                {venture.liveUrl ? (
                  <a
                    href={venture.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[color:var(--bd-lime)]"
                  >
                    shadaighar.com ↗
                  </a>
                ) : (
                  'Private beta'
                )}
              </dd>
            </div>
          </dl>
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="space-y-10 text-base leading-relaxed text-[color:var(--bd-bone)]/80">
              <section>
                <h3 className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
                  / The brief
                </h3>
                <p className="mt-3">
                  Shadai Ghar is a direct-to-consumer grocery operation in Faridpur. BusinessDawg
                  was brought in to design, build, and ship the entire product — storefront, ops
                  backend, and growth engine — fast enough to validate the unit economics.
                </p>
              </section>
              <section>
                <h3 className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
                  / What we shipped
                </h3>
                <p className="mt-3">
                  A Next.js storefront, Postgres + Prisma data layer, payments, image pipeline,
                  transactional email, AI shopping recommendations, and full admin workflows. Built
                  from scratch in six weeks.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {venture.stack.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
                  / The outcome
                </h3>
                <ul className="mt-3 space-y-2">
                  {venture.metrics.map((m) => (
                    <li key={m} className="flex items-start gap-3">
                      <span className="mt-3 inline-block h-1 w-4 bg-[color:var(--bd-lime)]" />
                      {m}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="space-y-5">
              {GALLERY.map((shot) => (
                <figure
                  key={shot.src}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)]"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      fill
                      sizes="(min-width: 1024px) 35vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="border-t border-white/8 px-5 py-3 font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/60 uppercase">
                    {shot.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)] p-8">
            <p className="font-display text-2xl font-bold italic">
              Want to see how the machine runs?
            </p>
            <MagneticButton href="/contact">Book a Call →</MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
