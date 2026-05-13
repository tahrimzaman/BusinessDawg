'use client';

import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import KineticText from '@/components/motion/KineticText';
import MagneticButton from '@/components/motion/MagneticButton';
import { EASE } from '@/lib/motion/easing';

/**
 * Hero — minimal lime/black/white. Real mascot PNG (no R3F primitives).
 * Idle bob + cursor-driven tilt. Reduces to a static image under
 * prefers-reduced-motion (handled globally in globals.css).
 */
export default function Hero() {
  // Cursor parallax — normalized -0.5..0.5 from viewport center.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 18 });
  const sy = useSpring(my, { stiffness: 80, damping: 18 });

  const tiltY = useTransform(sx, [-0.5, 0.5], [-6, 6]);
  const tiltX = useTransform(sy, [-0.5, 0.5], [3, -3]);
  const translateX = useTransform(sx, [-0.5, 0.5], [-10, 10]);

  useEffect(() => {
    const handle = (e: PointerEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mx.set((e.clientX - cx) / window.innerWidth);
      my.set((e.clientY - cy) / window.innerHeight);
    };
    window.addEventListener('pointermove', handle, { passive: true });
    return () => window.removeEventListener('pointermove', handle);
  }, [mx, my]);

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-24">
      {/* Lime radial glow behind the mascot — only accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 55% 50% at 75% 60%, color-mix(in srgb, var(--bd-lime) 16%, transparent) 0%, transparent 60%)',
        }}
      />

      {/* Bottom fade-to-ink seam */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-[color:var(--bd-ink)]" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 md:grid-cols-12">
        {/* Copy column */}
        <div className="md:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase backdrop-blur-md"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--bd-lime)]" />A
            business growth system studio · Est. 2026
          </motion.div>

          <h1 className="font-display max-w-[14ch] text-5xl leading-[0.95] font-extrabold tracking-tight text-[color:var(--bd-bone)] italic sm:text-6xl md:text-7xl lg:text-[7rem]">
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

        {/* Mascot column */}
        <div className="relative md:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
            style={{
              rotateX: tiltX,
              rotateY: tiltY,
              x: translateX,
              transformPerspective: 1200,
            }}
            className="relative mx-auto aspect-[4/5] w-full max-w-[420px] md:max-w-[520px]"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative h-full w-full"
            >
              <Image
                src="/brand/mascot-hero.png"
                alt="BusinessDawg mascot"
                fill
                sizes="(min-width: 768px) 40vw, 80vw"
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
