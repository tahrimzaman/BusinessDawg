import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import { WORK_CONCEPTS } from '@/lib/copy';

export default function WorkTeaser() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / Client work
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight italic sm:text-5xl">
              Selected engagements.
            </h2>
            <Link
              href="/work"
              className="text-sm font-semibold text-[color:var(--bd-bone)]/70 hover:text-[color:var(--bd-lime)]"
              data-cursor="dawg"
            >
              See all client work →
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {WORK_CONCEPTS.map((w, i) => (
            <Reveal key={w.slug} delay={i * 0.06}>
              <Link
                href={`/work/${w.slug}`}
                data-cursor="dawg"
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-6"
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
                  <h3 className="font-display mt-1 text-2xl font-bold italic">{w.title}</h3>
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
    </section>
  );
}
