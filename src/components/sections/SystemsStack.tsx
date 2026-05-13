'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { SYSTEMS } from '@/lib/copy';
import Reveal from '@/components/motion/Reveal';
import { EASE } from '@/lib/motion/easing';

export default function SystemsStack() {
  return (
    <section id="systems" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / The Systems Stack
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-3 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight text-[color:var(--bd-bone)] italic sm:text-5xl md:text-6xl">
            Five systems. One studio.
            <br />
            <span className="text-[color:var(--bd-lime)]">
              Stack them however your business needs.
            </span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-5">
          {SYSTEMS.map((s, i) => (
            <SystemCard key={s.slug} system={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SystemCard({ system, index }: { system: (typeof SYSTEMS)[number]; index: number }) {
  const [hover, setHover] = useState(false);
  const price =
    system.pricing.kind === 'starter'
      ? `Starter pack — from ${system.pricing.from}`
      : 'Custom build — book a call';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: EASE }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      data-cursor="dawg"
      className="group relative overflow-hidden rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-8 md:p-10"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-1 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(600px circle at var(--mx,50%) var(--my,50%), color-mix(in srgb, var(--bd-lime) 22%, transparent), transparent 60%)',
        }}
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
            transition={{ duration: 0.35, ease: EASE }}
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
