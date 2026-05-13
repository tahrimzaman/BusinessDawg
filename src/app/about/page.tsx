import Reveal from '@/components/motion/Reveal';
import Founder from '@/components/sections/Founder';
import ShadaiShowcase from '@/components/sections/ShadaiShowcase';
import MagneticButton from '@/components/motion/MagneticButton';

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

      {/* Section 3 — Flagship build (Shadai) */}
      <ShadaiShowcase />

      {/* Section 4 — Values */}
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
      </div>

      {/* Section 5 — Motto */}
      <div className="mx-auto mt-32 max-w-6xl px-6 pb-32 text-center">
        <Reveal pace="late">
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / The motto
          </p>
        </Reveal>
        <Reveal delay={0.1} pace="late">
          <p className="font-display mt-6 text-[clamp(2rem,5vw,5rem)] leading-[1.05] font-extrabold tracking-tight italic">
            We build the <span className="text-[color:var(--bd-lime)]">machine.</span>
            <br />
            You run the business.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-12 inline-flex">
            <MagneticButton href="/contact">Book a Call →</MagneticButton>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
