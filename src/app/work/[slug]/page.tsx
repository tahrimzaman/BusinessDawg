import { notFound } from 'next/navigation';
import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';
import { WORK_CONCEPTS } from '@/lib/copy';

type Params = { slug: string };

export function generateStaticParams() {
  return WORK_CONCEPTS.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const w = WORK_CONCEPTS.find((x) => x.slug === slug);
  return { title: w?.title ?? 'Case study' };
}

export default async function CasePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const work = WORK_CONCEPTS.find((w) => w.slug === slug);
  if (!work) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 pt-40 pb-24">
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--bd-lime)]/40 px-3 py-1 font-mono text-[10px] tracking-widest text-[color:var(--bd-lime)] uppercase">
          {work.tag}
        </span>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="font-display mt-6 text-5xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
          {work.title}.
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 text-xl text-[color:var(--bd-bone)]/70">{work.blurb}</p>
      </Reveal>

      <Reveal delay={0.12}>
        <dl className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { k: 'Role', v: work.role },
            { k: 'Status', v: 'Concept · v1' },
            { k: 'Year', v: '2026' },
          ].map((row) => (
            <div key={row.k} className="border-t border-white/8 pt-4">
              <dt className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
                {row.k}
              </dt>
              <dd className="mt-2 text-lg font-semibold">{row.v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal>
        <div className="mt-20 space-y-12 text-lg leading-relaxed text-[color:var(--bd-bone)]/80">
          <section>
            <h2 className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              / Problem
            </h2>
            <p className="mt-4">
              Placeholder case copy. Real engagement narratives slot in here once we ship public
              client work. The dawg doesn’t exaggerate.
            </p>
          </section>
          <section>
            <h2 className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              / Approach
            </h2>
            <p className="mt-4">
              We’d audit the system, identify the leak, ship the fix in weeks. Iterate from there.
            </p>
          </section>
          <section>
            <h2 className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              / Outcome
            </h2>
            <p className="mt-4">
              When this becomes a real case study, the metrics go here. Until then, this is signal,
              not proof.
            </p>
          </section>
        </div>
      </Reveal>

      <Reveal>
        <div className="mt-20 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)] p-8">
          <p className="font-display text-2xl font-bold italic">Have a similar problem?</p>
          <MagneticButton href="/contact">Book a Call →</MagneticButton>
        </div>
      </Reveal>
    </div>
  );
}
