import Reveal from '@/components/motion/Reveal';
import Founder from '@/components/sections/Founder';
import { PULL_QUOTES } from '@/lib/copy';

export const metadata = { title: 'About' };

const VALUES = [
  { t: 'Ship, then perfect.', d: 'A working v1 beats a polished v0 every time.' },
  { t: 'Operate in public.', d: 'We build like the world is watching, because soon enough it is.' },
  {
    t: 'No corporate cosplay.',
    d: 'No synergy, no leverage, no “in today’s world”. Just the work.',
  },
  {
    t: 'The machine is the deliverable.',
    d: 'Not the slide. Not the logo. The system that keeps running.',
  },
];

export default function About() {
  return (
    <div className="relative">
      {/* Section 1 — Page heading */}
      <div className="mx-auto max-w-4xl px-6 pt-40 pb-8">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / About
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display mt-3 text-5xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
            We build <span className="text-[color:var(--bd-lime)]">business machines.</span>
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 space-y-6 text-lg leading-relaxed text-[color:var(--bd-bone)]/80">
            <p>
              Most agencies want to sell you a logo. Most consultants want to sell you a deck. I
              want to sell you the machine — the actual thing that turns inputs into customers into
              cash, on repeat.
            </p>
            <p>
              BusinessDawg is a studio for the operators — founders who already understand that the
              brand, the funnel, the product, and the ops are one system, not four invoices.
            </p>
          </div>
        </Reveal>
      </div>

      {/* Section 2 — Brains behind BusinessDawg (founder block) */}
      <Founder />

      {/* Section 3 — Values */}
      <div className="mx-auto max-w-4xl px-6">
        <Reveal>
          <h2 className="mt-24 font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / What we believe
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.t} className="bd-card p-6">
                <h3 className="font-display text-xl font-bold italic">{v.t}</h3>
                <p className="mt-2 text-sm text-[color:var(--bd-bone)]/70">{v.d}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-24 border-t border-white/8 pt-12 pb-24">
            <h2 className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              / Pull quotes
            </h2>
            <ul className="mt-6 space-y-3">
              {PULL_QUOTES.map((q) => (
                <li
                  key={q}
                  className="font-display text-2xl text-[color:var(--bd-bone)]/85 italic sm:text-3xl"
                >
                  “{q}”
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
