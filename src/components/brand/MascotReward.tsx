'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '@/lib/motion/easing';
import { TIMING } from '@/lib/motion/timing';

/**
 * Pos 4 reward state. Renders in two variants:
 *  - 'overlay'  : fixed full-screen confirmation (Cal.com / Contact form).
 *  - 'inline'   : drop-in card replacing an inline form (Newsletter).
 */
export default function MascotReward({
  headline,
  sub,
  variant = 'inline',
  onDismiss,
}: {
  headline: string;
  sub?: string;
  variant?: 'overlay' | 'inline';
  onDismiss?: () => void;
}) {
  const reduced = useReducedMotion();
  const dur = reduced ? 0.2 : TIMING.reveal;

  if (variant === 'overlay') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: dur, ease: EASE }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--bd-ink)]/85 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: dur, ease: EASE, delay: 0.1 }}
          className="bd-card relative mx-6 grid w-full max-w-3xl items-center gap-8 p-10 md:grid-cols-2 md:p-14"
        >
          <div className="relative aspect-[3/4] w-full">
            <Image
              src="/brand/mascot-pos-4.png"
              alt="BusinessDawg mascot thumbs up"
              fill
              sizes="(min-width: 768px) 40vw, 80vw"
              className="object-contain object-bottom"
            />
          </div>
          <div>
            <h3 className="font-display text-4xl leading-[1.05] font-extrabold italic sm:text-5xl">
              <span className="text-[color:var(--bd-lime)]">{headline}</span>
            </h3>
            {sub ? (
              <p className="mt-4 text-base text-[color:var(--bd-bone)]/70 sm:text-lg">{sub}</p>
            ) : null}
            {onDismiss ? (
              <button
                onClick={onDismiss}
                data-cursor="dawg"
                className="mt-8 inline-flex h-11 items-center rounded-full bg-[color:var(--bd-lime)] px-5 text-sm font-semibold text-[color:var(--bd-ink)] transition-transform hover:scale-[1.02]"
              >
                Got it →
              </button>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur, ease: EASE }}
      className="bd-card relative grid items-center gap-6 p-8 sm:grid-cols-[160px_1fr] md:p-10"
    >
      <div className="relative aspect-[3/4] w-full max-w-[160px]">
        <Image
          src="/brand/mascot-pos-4.png"
          alt="BusinessDawg mascot thumbs up"
          fill
          sizes="160px"
          className="object-contain object-bottom"
        />
      </div>
      <div>
        <h4 className="font-display text-3xl font-extrabold italic">
          <span className="text-[color:var(--bd-lime)]">{headline}</span>
        </h4>
        {sub ? (
          <p className="mt-3 text-sm text-[color:var(--bd-bone)]/70 sm:text-base">{sub}</p>
        ) : null}
      </div>
    </motion.div>
  );
}
