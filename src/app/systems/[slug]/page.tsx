import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';
import Faq from '@/components/sections/Faq';
import { ServiceJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { SYSTEMS, FAQ } from '@/lib/copy';

type Params = { slug: string };

export function generateStaticParams() {
  return SYSTEMS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SYSTEMS.find((x) => x.slug === slug);
  if (!s) return { title: 'System' };
  const description = s.description;
  const url = `https://businessdawg.com/systems/${s.slug}`;
  return {
    title: s.name,
    description,
    alternates: { canonical: `/systems/${s.slug}` },
    openGraph: {
      title: `${s.name} — BusinessDawg`,
      description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${s.name} — BusinessDawg`,
      description,
    },
  };
}

export default async function SystemPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const system = SYSTEMS.find((s) => s.slug === slug);
  if (!system) notFound();

  const idx = SYSTEMS.findIndex((s) => s.slug === slug);
  const next = SYSTEMS[(idx + 1) % SYSTEMS.length];
  const url = `https://businessdawg.com/systems/${system.slug}`;

  return (
    <>
      <ServiceJsonLd
        name={system.name}
        description={`${system.tagline} ${system.description}`}
        url={url}
        serviceType={system.shortName}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://businessdawg.com' },
          { name: 'Systems', url: 'https://businessdawg.com/systems' },
          { name: system.name, url },
        ]}
      />
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / {system.shortName} system
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display mt-4 max-w-4xl text-4xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
            {system.name}.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-xl text-[color:var(--bd-bone)]/70">{system.tagline}</p>
        </Reveal>

        {/* What it is — long-form when whatItIs is set, otherwise the short tagline-only fallback */}
        {system.whatItIs && system.whatItIs.length > 0 ? (
          <Reveal>
            <section className="mt-14 max-w-3xl">
              <h2 className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
                What it is
              </h2>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-[color:var(--bd-bone)]/85">
                {system.whatItIs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          </Reveal>
        ) : (
          <Reveal>
            <section className="mt-14 max-w-2xl">
              <h2 className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
                What it is
              </h2>
              <p className="mt-4 text-lg text-[color:var(--bd-bone)]/85">{system.description}</p>
            </section>
          </Reveal>
        )}

        {/* What you actually get — expanded cards with timeline when deliverableDetails is set */}
        {system.deliverableDetails && system.deliverableDetails.length > 0 ? (
          <Reveal delay={0.06}>
            <section className="mt-16">
              <h2 className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
                What you actually get
              </h2>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {system.deliverableDetails.map((d) => (
                  <article
                    key={d.title}
                    className="flex flex-col rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-6"
                  >
                    <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
                      {d.timeline}
                    </p>
                    <h3 className="font-display mt-3 text-2xl font-bold italic">{d.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[color:var(--bd-bone)]/75">
                      {d.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </Reveal>
        ) : (
          <Reveal delay={0.06}>
            <section className="mt-12 max-w-2xl">
              <h2 className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
                What you get
              </h2>
              <ul className="mt-4 space-y-3">
                {system.deliverables.map((d) => (
                  <li
                    key={d}
                    className="flex items-start gap-3 text-lg text-[color:var(--bd-bone)]/85"
                  >
                    <span className="mt-3 inline-block h-1 w-4 bg-[color:var(--bd-lime)]" />
                    {d}
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}

        <Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                n: '01',
                t: 'Audit',
                d: 'We map what you’ve got, what’s leaking, what to build first.',
              },
              {
                n: '02',
                t: 'Build',
                d: 'We ship the system in weeks, not quarters. You see it as it lands.',
              },
              {
                n: '03',
                t: 'Hand off',
                d: 'Docs, training, and the rules so your team keeps running it.',
              },
            ].map((step) => (
              <div
                key={step.n}
                className="rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-6"
              >
                <p className="font-mono text-xs text-[color:var(--bd-lime)]">{step.n}</p>
                <h3 className="font-display mt-2 text-2xl font-bold italic">{step.t}</h3>
                <p className="mt-2 text-sm text-[color:var(--bd-bone)]/65">{step.d}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-14 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-[color:var(--bd-lime)]/30 bg-[color:var(--bd-lime)]/5 p-8">
            <div>
              <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
                Scoped on a call
              </p>
              <p className="font-display mt-2 text-2xl font-bold italic">Ready to build it?</p>
            </div>
            <MagneticButton href="/contact">Book a Call →</MagneticButton>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-14 border-t border-white/8 pt-10">
            <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
              Next system
            </p>
            <Link
              href={`/systems/${next.slug}`}
              className="mt-2 inline-flex items-center gap-2 text-3xl font-bold italic hover:text-[color:var(--bd-lime)]"
            >
              {next.name} →
            </Link>
          </div>
        </Reveal>
      </div>
      <Faq
        items={FAQ.slice(0, 6)}
        eyebrow="/ Common questions"
        heading="Before you book the call."
      />
    </>
  );
}
