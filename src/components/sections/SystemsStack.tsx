'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import { useRef, useState } from 'react';
import { SYSTEMS } from '@/lib/copy';
import Reveal from '@/components/motion/Reveal';
import KineticText from '@/components/motion/KineticText';
import PrincipleBuildIcon from '@/components/illustrations/PrincipleBuildIcon';
import PrincipleAgentIcon from '@/components/illustrations/PrincipleAgentIcon';
import PrincipleOperatorIcon from '@/components/illustrations/PrincipleOperatorIcon';
import { EASE } from '@/lib/motion/easing';
import { TIMING, STAGGER_SLOW } from '@/lib/motion/timing';
import { useTweaks } from '@/lib/dev/tweaks';

const PRINCIPLES = [
  {
    n: '01',
    title: 'We don’t consult. We build.',
    body: 'No 80-page strategy decks. No "we recommend you consider". We get hired to ship — brand identities, AI workflows, websites, growth funnels — and we hand them off as running systems, not slideware.',
    Icon: PrincipleBuildIcon,
  },
  {
    n: '02',
    title: 'AI is the new factory floor.',
    body: 'The studios that win this decade are the ones that wire AI into how a business actually operates. We build internal agents, content engines, and automations so your team stops doing what software should already be doing.',
    Icon: PrincipleAgentIcon,
  },
  {
    n: '03',
    title: 'Operators first.',
    body: 'BusinessDawg was started by an operator who got tired of agencies that have never run a real business. Every system we build is shaped by the question: what would the founder actually use on a Monday morning?',
    Icon: PrincipleOperatorIcon,
  },
];

export default function SystemsStack() {
  return (
    <section className="relative overflow-hidden py-14 md:py-20 lg:py-28">
      <div className="bd-section-glow" />
      <div className="relative mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / The Studio
          </p>
        </Reveal>
        <Reveal delay={0.05} pace="late">
          <h2 className="font-display mt-3 max-w-4xl text-3xl leading-[1.05] font-bold tracking-tight text-[color:var(--bd-bone)] sm:text-4xl md:text-5xl lg:text-6xl">
            <KineticText text="A studio for the AI era." className="block" />
            <KineticText
              text="Built for founders who actually ship."
              className="bd-punchline block text-[color:var(--bd-lime)]"
              delay={0.32}
            />
          </h2>
        </Reveal>
        <Reveal delay={0.5}>
          <p className="font-display mt-6 text-xl leading-tight font-bold tracking-tight text-[color:var(--bd-bone)]/80 italic sm:text-2xl">
            Built by operators.{' '}
            <span className="text-[color:var(--bd-lime)]">Wired for shippers.</span>
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:mt-16 md:grid-cols-3 md:gap-7">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.n} delay={0.6 + i * 0.05}>
              <PrincipleFlipCard principle={p} />
            </Reveal>
          ))}
        </div>

        {/* Beat shift: "this is the studio" → "here's the menu". One section,
            two acts. */}
        <div
          aria-hidden
          className="my-12 h-px w-full border-t border-dashed border-[color:var(--bd-lime)]/30 md:my-16"
        />

        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / The Systems Stack
          </p>
        </Reveal>
        <Reveal delay={0.05} pace="late">
          <h2 className="font-display mt-3 max-w-3xl text-3xl leading-[1.05] font-bold tracking-tight text-[color:var(--bd-bone)] italic sm:text-4xl md:text-5xl lg:text-6xl">
            Five systems. One studio.
            <br />
            <span className="text-[color:var(--bd-lime)]">
              Stack them however your business needs.
            </span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Sticky mascot rail (Pos 2) */}
          <div className="relative lg:col-span-4">
            <div className="sticky top-16 z-10 flex h-[30vh] flex-col lg:top-24 lg:h-[80vh]">
              <div className="relative h-full w-full flex-1">
                {/* Floor glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
                  style={{
                    background:
                      'radial-gradient(ellipse 60% 100% at 50% 100%, color-mix(in srgb, var(--bd-lime) 22%, transparent) 0%, transparent 70%)',
                    filter: 'blur(8px)',
                  }}
                />
                <Image
                  src="/brand/mascot-pos-2.webp"
                  alt="BusinessDawg mascot — arms crossed"
                  fill
                  sizes="(min-width: 1024px) 30vw, 80vw"
                  className="relative object-contain object-bottom"
                />
              </div>
              {/* Caption rail */}
              <div className="mt-6 hidden lg:block">
                <p className="font-mono text-[11px] tracking-widest text-[color:var(--bd-lime)] uppercase">
                  / Pos 02 // The middle
                </p>
                <p className="font-display mt-2 text-2xl leading-tight font-bold tracking-tight text-[color:var(--bd-bone)] italic">
                  Built different.
                </p>
              </div>
            </div>

            {/* Totally-customized flip card — sits below the sticky rail in
                normal flow so the mascot keeps its full sticky height. */}
            <div className="mt-12 hidden lg:block">
              <CustomBuildCard />
            </div>
          </div>

          {/* Cards */}
          <div className="grid gap-5 lg:col-span-8">
            {SYSTEMS.map((s, i) => (
              <SystemCard key={s.slug} system={s} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PrincipleFlipCard({ principle }: { principle: (typeof PRINCIPLES)[number] }) {
  const { Icon } = principle;
  // Mobile (and keyboard) tap-to-flip. Desktop hover keeps working via the
  // existing group-hover class — both paths converge on the same rotateY.
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`${principle.title} — ${principle.body}`}
      aria-pressed={flipped}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
      className="group block w-full cursor-pointer [perspective:1200px] focus-visible:outline-none"
    >
      <div
        className={`relative aspect-[4/5] w-full transition-transform duration-700 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-visible:[transform:rotateY(180deg)] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* FRONT */}
        <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-7 transition-[border-color,box-shadow] duration-300 [backface-visibility:hidden] group-hover:border-[color:var(--bd-lime)]/60 group-hover:shadow-[0_0_36px_rgba(200,255,0,0.18)] group-focus-visible:border-[color:var(--bd-lime)]/60 group-focus-visible:shadow-[0_0_36px_rgba(200,255,0,0.18)] md:p-8">
          {/* Header row — eyebrow LEFT, title RIGHT */}
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              / {principle.n}
            </p>
            <p className="font-display truncate text-right text-sm font-bold tracking-tight text-[color:var(--bd-bone)] italic md:text-base">
              {principle.title}
            </p>
          </div>

          {/* Graphic with lime glow halo */}
          <div className="relative flex flex-1 items-center justify-center py-4">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 50% 50%, color-mix(in srgb, var(--bd-lime) 22%, transparent) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />
            <Icon className="relative h-auto w-[70%] max-w-[180px]" />
          </div>

          <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
            <span className="lg:hidden">tap to flip ↻</span>
            <span className="hidden lg:inline">hover to read →</span>
          </p>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 flex [transform:rotateY(180deg)] flex-col justify-between overflow-hidden rounded-3xl border border-[color:var(--bd-lime)]/60 bg-[color:var(--bd-ink)] p-7 shadow-[0_0_24px_rgba(200,255,0,0.18)] [backface-visibility:hidden] md:p-8">
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / {principle.n}
          </p>
          <p className="text-base leading-relaxed text-[color:var(--bd-bone)]/90 md:text-lg">
            {principle.body}
          </p>
          <p className="font-display text-lg font-bold tracking-tight text-[color:var(--bd-bone)] italic">
            {principle.title}
          </p>
        </div>
      </div>
    </div>
  );
}

function CustomBuildCard() {
  return (
    <Link
      href="/contact"
      aria-label="Totally customized service — tell us what you need"
      className="group block w-full max-w-[260px] [perspective:1200px]"
    >
      <div className="relative aspect-square w-full transition-transform duration-700 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-visible:[transform:rotateY(180deg)]">
        {/* FRONT */}
        <div className="absolute inset-0 flex flex-col items-center justify-between overflow-hidden rounded-[28px] border border-[rgba(200,255,0,0.6)] bg-[color:var(--bd-ink)] p-5 shadow-[0_0_24px_rgba(200,255,0,0.18)] transition-[border-color,box-shadow] duration-300 [backface-visibility:hidden] group-hover:border-[color:var(--bd-lime)] group-hover:shadow-[0_0_36px_rgba(200,255,0,0.32)]">
          <p className="self-start font-mono text-[10px] tracking-widest text-[color:var(--bd-lime)] uppercase">
            / Bonus
          </p>
          <div className="relative aspect-square w-[78%]">
            <Image
              src="/brand/icon.jpg"
              alt=""
              fill
              sizes="220px"
              className="object-contain"
              aria-hidden
            />
          </div>
          <p className="font-display text-center text-lg leading-tight font-bold tracking-tight text-[color:var(--bd-bone)] italic">
            Totally Customized?
          </p>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 flex [transform:rotateY(180deg)] flex-col items-start justify-between overflow-hidden rounded-[28px] border border-[rgba(200,255,0,0.6)] bg-[color:var(--bd-ink)] p-5 shadow-[0_0_24px_rgba(200,255,0,0.18)] transition-[border-color,box-shadow] duration-300 [backface-visibility:hidden] group-hover:border-[color:var(--bd-lime)] group-hover:shadow-[0_0_36px_rgba(200,255,0,0.32)]">
          <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-lime)] uppercase">
            / Off-stack
          </p>
          <p className="text-sm leading-snug text-[color:var(--bd-bone)]/85">
            Don&apos;t see your stack? We build fully custom systems too. Pick none of the five —
            we&apos;ll still ship.
          </p>
          <span className="font-mono text-xs font-semibold tracking-widest text-[color:var(--bd-lime)] uppercase">
            Tell us what you need →
          </span>
        </div>
      </div>
    </Link>
  );
}

function SystemCard({ system, index }: { system: (typeof SYSTEMS)[number]; index: number }) {
  const reduced = useReducedMotion();
  const tweaks = useTweaks();
  const [hover, setHover] = useState(false);
  // Mobile tap-toggle (chevron). Desktop uses hover via pointerEnter/Leave.
  // We open the deliverables list when EITHER is true — hover stays mouse-only,
  // tapped only triggers from the explicit mobile chevron button.
  const [tapped, setTapped] = useState(false);
  const open = hover || tapped;
  const dur = (reduced ? 0.2 : TIMING.reveal) * (reduced ? 1 : tweaks.pace);

  // Cursor-following spotlight
  const cardRef = useRef<HTMLDivElement | null>(null);
  const mxRaw = useMotionValue(50);
  const myRaw = useMotionValue(50);
  const mx = useSpring(mxRaw, { stiffness: 200, damping: 30, mass: 0.4 });
  const my = useSpring(myRaw, { stiffness: 200, damping: 30, mass: 0.4 });
  const mxPct = useMotionTemplate`${mx}%`;
  const myPct = useMotionTemplate`${my}%`;

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    mxRaw.set(Math.max(0, Math.min(100, x)));
    myRaw.set(Math.max(0, Math.min(100, y)));
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -5% 0px' }}
      transition={{ duration: dur, delay: index * STAGGER_SLOW, ease: EASE }}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setHover(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') setHover(false);
      }}
      onPointerMove={handlePointerMove}
      style={
        {
          '--mx': mxPct,
          '--my': myPct,
        } as React.CSSProperties
      }
      className="bd-card group relative p-8 md:p-10"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(520px circle at var(--mx,50%) var(--my,50%), color-mix(in srgb, var(--bd-lime) 32%, transparent), transparent 60%)',
        }}
      />

      {/* Growing lime underline bar */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-[color:var(--bd-lime)] transition-[width] duration-500 ease-out group-hover:w-full"
      />

      <Link
        href={`/systems/${system.slug}`}
        className="relative grid items-start gap-6 md:grid-cols-12"
      >
        <div className="md:col-span-1">
          <span className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
            0{index + 1}
          </span>
        </div>

        <div className="md:col-span-7">
          <div className="flex items-center gap-3">
            <span className="text-3xl text-[color:var(--bd-lime)]">{system.glyph}</span>
            <h3 className="font-display text-2xl font-bold tracking-tight italic md:text-4xl">
              {system.name}
            </h3>
          </div>
          <p className="mt-3 max-w-xl text-base text-[color:var(--bd-bone)]/70">{system.tagline}</p>

          <motion.div
            initial={false}
            animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <ul className="mt-5 space-y-1.5 text-sm text-[color:var(--bd-bone)]/80">
              {system.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-2">
                  <span className="mt-2 inline-block h-1 w-3 bg-[color:var(--bd-lime)]" />
                  {d}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Mobile-only tap-to-expand chevron. preventDefault stops the
              wrapping <Link> from navigating when the chevron is tapped. */}
          <button
            type="button"
            aria-expanded={tapped}
            aria-label={tapped ? 'Hide deliverables' : 'Show deliverables'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setTapped((t) => !t);
            }}
            className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-[color:var(--bd-lime)] uppercase lg:hidden"
          >
            <span>{tapped ? 'hide' : "what's included"}</span>
            <span className={`transition-transform duration-300 ${tapped ? 'rotate-180' : ''}`}>
              ↓
            </span>
          </button>
        </div>

        <div className="md:col-span-4 md:text-right">
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
            Scoped on a call
          </p>
          <p className="mt-4 text-sm font-semibold text-[color:var(--bd-bone)] transition-colors group-hover:text-[color:var(--bd-lime)]">
            Explore →
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
