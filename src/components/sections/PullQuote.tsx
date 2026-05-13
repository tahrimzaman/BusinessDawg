'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useSyncExternalStore } from 'react';
import { PULL_QUOTES, SYSTEMS } from '@/lib/copy';
import { EASE } from '@/lib/motion/easing';
import { TIMING } from '@/lib/motion/timing';
import { useTweaks } from '@/lib/dev/tweaks';

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

/**
 * Breather section. One rotating pull-quote with word-by-word reveal,
 * then a 5-tile services row that hands the eye into the Systems Stack.
 */
export default function PullQuote() {
  const reduced = useReducedMotion();
  const tweaks = useTweaks();

  const quote = useDailyQuote();
  const words = quote.split(/\s+/);

  const envelope = (reduced ? 0.2 : TIMING.revealLate) * (reduced ? 1 : tweaks.pace);
  const perWord = reduced ? 0 : 0.08 * tweaks.pace;
  const quoteTotal = envelope + perWord * (words.length - 1);

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden py-32 md:min-h-screen">
      <div className="bd-section-glow" />
      <div className="relative mx-auto w-full max-w-6xl px-6 text-center">
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

        {/* Services tile row — staggers in after the quote */}
        <div className="mt-24 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5 lg:gap-8">
          {SYSTEMS.map((s, i) => (
            <motion.div
              key={s.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15%' }}
              transition={{
                duration: reduced ? 0.2 : 0.9 * tweaks.pace,
                delay: reduced ? 0 : quoteTotal + 0.4 + i * 0.12,
                ease: EASE,
              }}
            >
              <Link
                href={`/systems/${s.slug}`}
                className="group flex h-full flex-col items-center rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-6 text-center transition-all hover:-translate-y-0.5 hover:border-[color:var(--bd-lime)]/60 hover:bg-white/[0.04]"
              >
                <span className="text-4xl text-[color:var(--bd-lime)]">{s.glyph}</span>
                <h3 className="font-display mt-3 text-lg font-bold tracking-tight italic">
                  {s.shortName}
                </h3>
                <p className="mt-2 text-xs leading-snug text-[color:var(--bd-bone)]/60">
                  {s.tagline}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
