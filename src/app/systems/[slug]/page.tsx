import { notFound } from 'next/navigation';
import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';
import { SYSTEMS } from '@/lib/copy';

type Params = { slug: string };

export function generateStaticParams() {
  return SYSTEMS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const s = SYSTEMS.find((x) => x.slug === slug);
  return { title: s?.shortName ?? 'System' };
}

export default async function SystemPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const system = SYSTEMS.find((s) => s.slug === slug);
  if (!system) notFound();

  const idx = SYSTEMS.findIndex((s) => s.slug === slug);
  const next = SYSTEMS[(idx + 1) % SYSTEMS.length];

  const price =
    system.pricing.kind === 'starter'
      ? `Starter pack — from ${system.pricing.from}`
      : 'Custom build — book a call';

  return (
    <div className="mx-auto max-w-6xl px-6 pt-40 pb-24">
      <Reveal>
        <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
          / {system.shortName} system
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="font-display mt-4 max-w-4xl text-5xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
          {system.name}.
        </h1>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mt-6 max-w-2xl text-xl text-[color:var(--bd-bone)]/70">{system.tagline}</p>
      </Reveal>

      <div className="mt-20 grid gap-12 md:grid-cols-2">
        <Reveal>
          <h2 className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
            What it is
          </h2>
          <p className="mt-4 text-lg text-[color:var(--bd-bone)]/85">{system.description}</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
            What you get
          </h2>
          <ul className="mt-4 space-y-3">
            {system.deliverables.map((d) => (
              <li key={d} className="flex items-start gap-3 text-lg text-[color:var(--bd-bone)]/85">
                <span className="mt-3 inline-block h-1 w-4 bg-[color:var(--bd-lime)]" />
                {d}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <Reveal>
        <div className="mt-20 grid gap-6 md:grid-cols-3">
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
        <div className="mt-20 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-[color:var(--bd-lime)]/30 bg-[color:var(--bd-lime)]/5 p-8">
          <div>
            <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              {price}
            </p>
            <p className="font-display mt-2 text-2xl font-bold italic">Ready to build it?</p>
          </div>
          <MagneticButton href="/contact">Book a Call →</MagneticButton>
        </div>
      </Reveal>

      <Reveal>
        <div className="mt-20 border-t border-white/8 pt-10">
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
            Next system
          </p>
          <Link
            href={`/systems/${next.slug}`}
            data-cursor="dawg"
            className="mt-2 inline-flex items-center gap-2 text-3xl font-bold italic hover:text-[color:var(--bd-lime)]"
          >
            {next.name} →
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
