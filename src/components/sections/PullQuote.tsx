'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useSyncExternalStore } from 'react';
import { PULL_QUOTES } from '@/lib/copy';

function subscribeNoop() {
  return () => {};
}
function useDailyQuote() {
  return useSyncExternalStore(
    subscribeNoop,
    () => {
      const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
      return PULL_QUOTES[day % PULL_QUOTES.length];
    },
    () => PULL_QUOTES[0],
  );
}
import { EASE } from '@/lib/motion/easing';
import { TIMING } from '@/lib/motion/timing';
import { useTweaks } from '@/lib/dev/tweaks';

/**
 * Full-viewport breather. One pull-quote, word-by-word reveal.
 * The last word lights up in lime.
 */
export default function PullQuote() {
  const reduced = useReducedMotion();
  const tweaks = useTweaks();

  const quote = useDailyQuote();

  const words = quote.split(/\s+/);

  const envelope = (reduced ? 0.2 : TIMING.revealLate) * (reduced ? 1 : tweaks.pace);
  const perWord = reduced ? 0 : 0.08 * tweaks.pace;

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden py-32 md:min-h-screen">
      <div className="bd-section-glow" />
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <h2 className="font-display text-[clamp(2.5rem,7vw,8rem)] leading-[0.98] font-extrabold tracking-tight text-[color:var(--bd-bone)] italic">
          {words.map((w, i) => (
            <motion.span
              key={`${w}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20%' }}
              transition={{
                duration: envelope,
                delay: i * perWord,
                ease: EASE,
              }}
              className={`mr-[0.25em] inline-block ${
                i === words.length - 1 ? 'text-[color:var(--bd-lime)]' : ''
              }`}
            >
              {w}
            </motion.span>
          ))}
        </h2>
      </div>
    </section>
  );
}
