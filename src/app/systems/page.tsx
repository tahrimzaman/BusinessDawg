import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import { SYSTEMS } from '@/lib/copy';

const description =
  'Five productized systems from BusinessDawg: Growth, AI Automation, Branding, Web & Product, Marketing Infrastructure. Pick one, stack a few, or go fully custom.';

export const metadata = {
  title: 'Systems',
  description,
  alternates: { canonical: '/systems' },
  openGraph: {
    title: 'The Systems Stack · BusinessDawg',
    description,
    url: 'https://businessdawg.com/systems',
    type: 'website' as const,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'The Systems Stack · BusinessDawg',
    description,
  },
};

export default function SystemsIndex() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-28 pb-16">
      <Reveal>
        <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
          / The Systems Stack
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="font-display mt-3 max-w-4xl text-4xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
          Five systems. Stack the ones you need.
        </h1>
      </Reveal>
      <div className="mt-12 grid gap-5">
        {SYSTEMS.map((s, i) => (
          <Reveal key={s.slug} delay={i * 0.04}>
            <Link
              href={`/systems/${s.slug}`}
              className="group flex items-start justify-between gap-8 rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-8 transition-colors hover:border-[color:var(--bd-lime)]/40 md:p-10"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-[color:var(--bd-lime)]">{s.glyph}</span>
                  <h2 className="font-display text-3xl font-bold italic md:text-4xl">{s.name}</h2>
                </div>
                <p className="mt-3 max-w-xl text-[color:var(--bd-bone)]/70">{s.tagline}</p>
              </div>
              <span className="hidden text-sm font-semibold text-[color:var(--bd-bone)]/70 group-hover:text-[color:var(--bd-lime)] md:inline">
                Explore →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
