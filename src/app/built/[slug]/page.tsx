import { notFound } from 'next/navigation';
import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';
import { BUILT } from '@/lib/copy';

type Params = { slug: string };

export function generateStaticParams() {
  return BUILT.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const b = BUILT.find((x) => x.slug === slug);
  return { title: b?.name ?? 'Founder venture' };
}

export default async function BuiltPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const venture = BUILT.find((b) => b.slug === slug);
  if (!venture) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 pt-40 pb-24">
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase">
          {venture.label}
        </span>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="font-display mt-6 text-5xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
          {venture.name}.
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 max-w-2xl text-xl text-[color:var(--bd-bone)]/70">{venture.tagline}</p>
      </Reveal>

      <Reveal delay={0.12}>
        <dl className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { k: 'Role', v: 'Founder + Operator' },
            { k: 'Timeline', v: '6 weeks to traction' },
            { k: 'Live', v: 'TBD' },
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
              / The business
            </h2>
            <p className="mt-4">
              Shadai Ghar is a direct-to-consumer grocery operation in Faridpur. 500 families in six
              weeks. 23–27% gross margin. Targeting 10,000 households and ~₹2 crore EBT/month at
              maturity.
            </p>
          </section>
          <section>
            <h2 className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              / The stack
            </h2>
            <p className="mt-4">
              Next.js storefront, Postgres + Prisma, payments, image pipeline, transactional email,
              AI shopping recommendations, full admin workflows. Built from scratch.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
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
            <h2 className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              / The outcome
            </h2>
            <ul className="mt-4 space-y-2">
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

      <Reveal>
        <div className="mt-20 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)] p-8">
          <p className="font-display text-2xl font-bold italic">
            Want to see how the machine runs?
          </p>
          <MagneticButton href="/contact">Book a Call →</MagneticButton>
        </div>
      </Reveal>
    </div>
  );
}
