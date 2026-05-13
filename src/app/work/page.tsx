import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import { WORK_CONCEPTS } from '@/lib/copy';

export const metadata = { title: 'Work' };

export default function WorkIndex() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-40 pb-24">
      <Reveal>
        <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
          / Client work
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="font-display mt-3 max-w-4xl text-5xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
          Engagements we’ve shipped.
        </h1>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mt-6 max-w-2xl text-lg text-[color:var(--bd-bone)]/65">
          Concept cards below until real case studies replace them. The dawg ships on purpose, not
          on vibes.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {WORK_CONCEPTS.map((w, i) => (
          <Reveal key={w.slug} delay={i * 0.06}>
            <Link
              href={`/work/${w.slug}`}
              data-cursor="dawg"
              className="group flex h-full flex-col justify-between rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-6"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#1a1a1a,#0a0a0a)]">
                <div className="flex h-full items-end justify-end p-4">
                  <span className="rounded-full border border-[color:var(--bd-lime)]/40 bg-black/40 px-3 py-1 font-mono text-[10px] tracking-widest text-[color:var(--bd-lime)] uppercase">
                    {w.tag}
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
                  {w.role}
                </p>
                <h2 className="font-display mt-1 text-2xl font-bold italic">{w.title}</h2>
                <p className="mt-2 text-sm text-[color:var(--bd-bone)]/60">{w.blurb}</p>
              </div>
              <p className="mt-6 text-sm font-semibold text-[color:var(--bd-bone)] transition-colors group-hover:text-[color:var(--bd-lime)]">
                Read case →
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
