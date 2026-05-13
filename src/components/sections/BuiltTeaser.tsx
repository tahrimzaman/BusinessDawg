import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import { BUILT } from '@/lib/copy';

export default function BuiltTeaser() {
  const shadai = BUILT[0];
  return (
    <section className="relative overflow-hidden py-32">
      <div className="bd-section-glow" />
      <div className="relative mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / Case study
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-3 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight italic sm:text-5xl">
            A working machine, <span className="text-[color:var(--bd-lime)]">shipped by us.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <Link
            href={`/built/${shadai.slug}`}
            data-cursor="dawg"
            className="bd-card group relative mt-12 block p-10 md:p-14"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,#c8ff0014,transparent_60%)]" />

            <div className="relative grid items-end gap-8 md:grid-cols-12">
              <div className="md:col-span-7">
                <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
                  {shadai.label}
                </p>
                <h3 className="font-display mt-4 text-5xl font-extrabold tracking-tight italic md:text-7xl">
                  {shadai.name}
                </h3>
                <p className="mt-4 max-w-xl text-lg text-[color:var(--bd-bone)]/70">
                  {shadai.tagline}
                </p>
              </div>

              <div className="md:col-span-5">
                <ul className="space-y-3 text-sm">
                  {shadai.metrics.map((m) => (
                    <li key={m} className="flex items-start gap-3 text-[color:var(--bd-bone)]/80">
                      <span className="mt-2 inline-block h-1 w-4 bg-[color:var(--bd-lime)]" />
                      {m}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-2">
                  {shadai.stack.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/60 uppercase"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative mt-10 flex items-center justify-between border-t border-white/8 pt-6">
              <span className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
                Case study
              </span>
              <span className="text-sm font-semibold text-[color:var(--bd-bone)] transition-colors group-hover:text-[color:var(--bd-lime)]">
                Read the case study →
              </span>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
