'use client';

import dynamic from 'next/dynamic';
import KineticText from '@/components/motion/KineticText';
import MagneticButton from '@/components/motion/MagneticButton';
import { motion } from 'framer-motion';
import { EASE } from '@/lib/motion/easing';

const HeroScene = dynamic(() => import('@/components/three/HeroScene'), { ssr: false });

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-24">
      {/* R3F backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-90">
        <HeroScene />
      </div>
      {/* fade-to-ink at the bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-[color:var(--bd-ink)]" />

      <div className="mx-auto w-full max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--bd-lime)]" />A
          business growth system studio · Est. 2026
        </motion.div>

        <h1 className="font-display max-w-[14ch] text-5xl leading-[0.95] font-extrabold tracking-tight text-[color:var(--bd-bone)] italic sm:text-6xl md:text-7xl lg:text-[8rem]">
          <KineticText text="We build" />
          <br />
          <span className="text-[color:var(--bd-lime)]">
            <KineticText text="business machines." delay={0.18} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: EASE }}
          className="mt-8 max-w-xl text-lg text-[color:var(--bd-bone)]/70 sm:text-xl"
        >
          Branding, AI, web, and growth systems for founders who actually ship.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6, ease: EASE }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <MagneticButton href="/contact">Book a Call →</MagneticButton>
          <MagneticButton href="#systems" variant="ghost">
            See the systems ↓
          </MagneticButton>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-16 hidden font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/40 uppercase sm:block"
        >
          scroll ↓
        </motion.div>
      </div>
    </section>
  );
}
