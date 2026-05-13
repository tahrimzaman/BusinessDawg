import Reveal from '@/components/motion/Reveal';
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
    <div className="mx-auto max-w-4xl px-6 pt-40 pb-24">
      <Reveal>
        <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
          / About
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="font-display mt-3 text-5xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
          We build business machines.
        </h1>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-12 space-y-6 text-lg leading-relaxed text-[color:var(--bd-bone)]/80">
          <p>
            By the time I was 22, I was running a distribution territory that moves around 8.5 crore
            taka a month. Two brands. FMCG and telecom. Twenty-four people on the ground. From depot
            opening to daily reconciliation, I make sure the thing runs.
          </p>
          <p>
            Then I flew to Boston with Team Fortune 501 to represent Bangladesh at Hult Prize
            Global. We made Top 20 of 5,000+ at Marico’s Over The Wall. We were good at the slides.
            We were better at the systems behind them.
          </p>
          <p>
            So I started{' '}
            <span className="font-semibold text-[color:var(--bd-lime)] italic">BusinessDawg</span>.
            Most agencies want to sell you a logo. Most consultants want to sell you a deck. I want
            to sell you the machine — the actual thing that turns inputs into customers into cash,
            on repeat.
          </p>
          <p>
            On the side, I run a separate company —{' '}
            <span className="font-semibold italic">Shadai Ghar</span>, a D2C grocery venture in
            Faridpur. 500 families in six weeks. 23–27% gross margins. Real e-commerce, real
            revenue. The reason I’m not asking you to take advice from someone who’s only ever made
            slides.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <h2 className="mt-24 font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
          / What we believe
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {VALUES.map((v) => (
            <div
              key={v.t}
              className="rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-6"
            >
              <h3 className="font-display text-xl font-bold italic">{v.t}</h3>
              <p className="mt-2 text-sm text-[color:var(--bd-bone)]/70">{v.d}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <div className="mt-24 border-t border-white/8 pt-12">
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
  );
}
