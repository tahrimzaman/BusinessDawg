import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import { BUILT } from '@/lib/copy';

export const metadata = { title: 'Built' };

export default function BuiltIndex() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-40 pb-24">
      <Reveal>
        <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
          / Founder ventures
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="font-display mt-3 max-w-4xl text-5xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
          Other companies I run.
        </h1>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mt-6 max-w-2xl text-lg text-[color:var(--bd-bone)]/65">
          Separate companies, separate brands. Same operator behind them.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-5">
        {BUILT.map((b) => (
          <Reveal key={b.slug}>
            <Link
              href={`/built/${b.slug}`}
              data-cursor="dawg"
              className="group block rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-10 md:p-14"
            >
              <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
                {b.label}
              </p>
              <h2 className="font-display mt-3 text-4xl font-extrabold italic md:text-6xl">
                {b.name}
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-[color:var(--bd-bone)]/70">{b.tagline}</p>
              <p className="mt-8 text-sm font-semibold text-[color:var(--bd-bone)] group-hover:text-[color:var(--bd-lime)]">
                Case study →
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
