'use client';

import Image from 'next/image';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import KineticText from '@/components/motion/KineticText';
import MagneticButton from '@/components/motion/MagneticButton';
import { EASE } from '@/lib/motion/easing';
import { TIMING } from '@/lib/motion/timing';
import { useTweaks } from '@/lib/dev/tweaks';

/**
 * Hero — Pos 1 mascot, slow cinematic entrance.
 * Mascot lives in cols 6–12 (right) with a 1-col overlap that lets
 * headline edges visually cross the mascot's bounding box without
 * crossing the figure itself. Layout responds to TweakPanel.
 */
export default function Hero() {
  const reduced = useReducedMotion();
  const tweaks = useTweaks();
  const dur = (reduced ? 0.2 : TIMING.hero) * (reduced ? 1 : tweaks.pace);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 24 });
  const sy = useSpring(my, { stiffness: 50, damping: 24 });
  const tiltY = useTransform(sx, [-0.5, 0.5], [-3, 3]);
  const tiltX = useTransform(sy, [-0.5, 0.5], [2, -2]);
  const translateX = useTransform(sx, [-0.5, 0.5], [-6, 6]);

  useEffect(() => {
    if (reduced) return;
    const handle = (e: PointerEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mx.set((e.clientX - cx) / window.innerWidth);
      my.set((e.clientY - cy) / window.innerHeight);
    };
    window.addEventListener('pointermove', handle, { passive: true });
    return () => window.removeEventListener('pointermove', handle);
  }, [mx, my, reduced]);

  // Mascot scale → vh height
  const mascotHeight =
    tweaks.mascotScale === 'giant'
      ? 'lg:h-[110vh]'
      : tweaks.mascotScale === 'editorial'
        ? 'lg:h-[70vh]'
        : 'lg:h-[92vh]';

  // Hero composition layout switch
  const layout = tweaks.heroComp;

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-24">
      {/* Lime radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 55% 50% at 72% 58%, color-mix(in srgb, var(--bd-lime) 14%, transparent) 0%, transparent 60%)',
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-[color:var(--bd-ink)]" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-6 lg:grid-cols-12 lg:gap-0 lg:px-32">
        {/* Copy column */}
        <div
          className={
            layout === 'stacked'
              ? 'lg:col-span-12 lg:text-center'
              : layout === 'overlap'
                ? 'relative z-10 lg:col-span-7'
                : 'relative z-10 lg:col-span-8'
          }
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur * 0.5, ease: EASE }}
            className="mb-8 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase backdrop-blur-md sm:px-3 sm:text-[11px]"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--bd-lime)]" />A
            business growth system studio · Est. 2026
          </motion.div>

          <h1 className="font-display text-5xl leading-[1.12] font-extrabold tracking-tight text-[color:var(--bd-bone)] uppercase italic sm:text-6xl md:text-7xl lg:text-[5rem]">
            <KineticText text="We build" />
            <br />
            <span className="text-[color:var(--bd-lime)]">
              <KineticText text="business machines." delay={0.22} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 1.1, duration: dur * 0.7, ease: EASE }}
            className="mt-8 max-w-xl text-lg text-[color:var(--bd-bone)]/70 sm:text-xl"
          >
            Branding, AI, web, and growth systems for founders who actually ship.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 1.35, duration: dur * 0.7, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagneticButton href="/contact">Book a Call →</MagneticButton>
            <MagneticButton href="#systems" variant="ghost">
              See the systems ↓
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : 1.9, duration: 0.6 }}
            className="mt-16 hidden font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/40 uppercase sm:block"
          >
            scroll ↓
          </motion.div>
        </div>

        {/* Mascot column */}
        <div
          className={
            layout === 'stacked'
              ? 'relative lg:col-span-12'
              : layout === 'overlap'
                ? 'pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[52%] lg:block'
                : 'relative lg:col-span-4'
          }
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.3, duration: dur, ease: EASE }}
            style={{
              rotateX: tiltX,
              rotateY: tiltY,
              x: translateX,
              transformPerspective: 1400,
            }}
            className={`relative mx-auto h-[60vh] w-full max-w-[600px] lg:mr-0 lg:ml-auto ${mascotHeight}`}
          >
            <motion.div
              animate={reduced ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative h-full w-full"
            >
              <Image
                src="/brand/mascot-pos-1.png"
                alt="BusinessDawg mascot"
                fill
                sizes="(min-width: 1024px) 50vw, 80vw"
                className="object-contain object-bottom"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
