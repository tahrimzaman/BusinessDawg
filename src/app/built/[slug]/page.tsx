import Image from 'next/image';
import { notFound } from 'next/navigation';
import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';
import { BUILT } from '@/lib/copy';

const GALLERIES: Record<string, { src: string; alt: string; caption: string }[]> = {
  shadai: [
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
  ],
};

type Params = { slug: string };

export function generateStaticParams() {
  return BUILT.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const b = BUILT.find((x) => x.slug === slug);
  return { title: b?.name ?? 'Case study' };
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
            { k: 'Role', v: 'Studio — design + build' },
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
              / The brief
            </h2>
            <p className="mt-4">
              Shadai Ghar is a direct-to-consumer grocery operation in Faridpur. BusinessDawg was
              brought in to design, build, and ship the entire product — storefront, ops backend,
              and growth engine — fast enough to validate the unit economics.
            </p>
          </section>
          <section>
            <h2 className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              / What we shipped
            </h2>
            <p className="mt-4">
              A Next.js storefront, Postgres + Prisma data layer, payments, image pipeline,
              transactional email, AI shopping recommendations, and full admin workflows. Built from
              scratch in six weeks.
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

      {GALLERIES[slug]?.length ? (
        <Reveal>
          <div className="mt-20">
            <h2 className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              / Inside the machine
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {GALLERIES[slug].map((shot) => (
                <figure
                  key={shot.src}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)]"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      fill
                      sizes="(min-width: 768px) 45vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="border-t border-white/8 px-5 py-3 font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/60 uppercase">
                    {shot.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </Reveal>
      ) : null}

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
