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
import { EASE } from '@/lib/motion/easing';
import { TIMING, STAGGER_SLOW } from '@/lib/motion/timing';
import { useTweaks } from '@/lib/dev/tweaks';

export default function SystemsStack() {
  return (
    <section className="relative overflow-hidden py-32 md:py-48">
      <div className="bd-section-glow" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-32">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / The Systems Stack
          </p>
        </Reveal>
        <Reveal delay={0.05} pace="late">
          <h2 className="font-display mt-3 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight text-[color:var(--bd-bone)] italic sm:text-5xl md:text-6xl">
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
            <div className="lg:sticky lg:top-24 lg:flex lg:h-[80vh] lg:flex-col">
              <div className="relative h-[40vh] w-full lg:h-full lg:flex-1">
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
                  src="/brand/mascot-pos-2.png"
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

function SystemCard({ system, index }: { system: (typeof SYSTEMS)[number]; index: number }) {
  const reduced = useReducedMotion();
  const tweaks = useTweaks();
  const [hover, setHover] = useState(false);
  const dur = (reduced ? 0.2 : TIMING.reveal) * (reduced ? 1 : tweaks.pace);
  const price =
    system.pricing.kind === 'starter'
      ? `Starter pack — from ${system.pricing.from}`
      : 'Custom build — book a call';

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
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: dur, delay: index * STAGGER_SLOW, ease: EASE }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
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
          <span className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/40 uppercase">
            0{index + 1}
          </span>
        </div>

        <div className="md:col-span-7">
          <div className="flex items-center gap-3">
            <span className="text-3xl text-[color:var(--bd-lime)]">{system.glyph}</span>
            <h3 className="font-display text-3xl font-bold tracking-tight italic md:text-4xl">
              {system.name}
            </h3>
          </div>
          <p className="mt-3 max-w-xl text-base text-[color:var(--bd-bone)]/70">{system.tagline}</p>

          <motion.div
            initial={false}
            animate={{ height: hover ? 'auto' : 0, opacity: hover ? 1 : 0 }}
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
        </div>

        <div className="md:col-span-4 md:text-right">
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
            {price}
          </p>
          <p className="mt-4 text-sm font-semibold text-[color:var(--bd-bone)] transition-colors group-hover:text-[color:var(--bd-lime)]">
            Explore →
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
