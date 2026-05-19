'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Reveal from '@/components/motion/Reveal';
import { EASE } from '@/lib/motion/easing';

export default function Faq({
  eyebrow = '/ Frequently asked',
  heading = 'The questions we keep getting.',
  items,
}: {
  eyebrow?: string;
  heading?: string;
  items: { q: string; a: string }[];
}) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-12 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            {eyebrow}
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-3 max-w-3xl text-3xl leading-[1.05] font-bold tracking-tight text-[color:var(--bd-bone)] italic sm:text-4xl md:text-5xl">
            {heading}
          </h2>
        </Reveal>

        <div className="mt-12 divide-y divide-white/8 border-y border-white/8">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={Math.min(i, 4) * 0.04}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-trigger-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-center justify-between gap-6 rounded-lg py-6 text-left transition-colors hover:text-[color:var(--bd-lime)] focus-visible:text-[color:var(--bd-lime)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--bd-lime)] md:py-7"
                >
                  <span className="font-display text-lg font-bold tracking-tight text-[color:var(--bd-bone)] italic md:text-2xl">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--bd-lime)]/40 font-mono text-base text-[color:var(--bd-lime)] transition-transform duration-300 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduced ? 0.15 : 0.4, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-3xl pr-12 pb-6 text-base leading-relaxed text-[color:var(--bd-bone)]/80 md:pb-8 md:text-lg">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
