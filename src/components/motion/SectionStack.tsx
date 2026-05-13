'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { EASE } from '@/lib/motion/easing';

/**
 * SectionStack — fixed left-edge accumulating section labels (lg+ only).
 * As each section's mid-line crosses the viewport center, that section's
 * label cascades into the stack letter-by-letter. Past sections stay dim;
 * current section is lime with a wider indicator bar. Replaces the deleted
 * VerticalMarquee (Round 8). Mobile renders nothing.
 */

const SECTIONS = [
  { id: 'hero', label: 'BUILD' },
  { id: 'reel', label: 'ROAST' },
  { id: 'systems', label: 'STACK' },
  { id: 'chatbot', label: 'TALK' },
  { id: 'join', label: 'JOIN' },
  { id: 'ship', label: 'SHIP' },
] as const;

export default function SectionStack() {
  const reduced = useReducedMotion();
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    function recompute() {
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < SECTIONS.length; i++) {
        const el = document.getElementById(SECTIONS[i].id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) {
          best = i;
          bestDist = -1;
          continue;
        }
        const d = Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
        if (bestDist >= 0 && d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      setActiveIdx(best);
      setVisited((prev) => {
        if (prev.has(best)) return prev;
        const next = new Set(prev);
        next.add(best);
        return next;
      });
    }
    recompute();
    window.addEventListener('scroll', recompute, { passive: true });
    window.addEventListener('resize', recompute);
    return () => {
      window.removeEventListener('scroll', recompute);
      window.removeEventListener('resize', recompute);
    };
  }, []);

  return (
    <aside
      aria-hidden
      className="pointer-events-none fixed top-24 left-6 z-20 hidden flex-col gap-3 lg:flex"
    >
      <AnimatePresence initial={false}>
        {SECTIONS.map((s, i) => {
          if (!visited.has(i)) return null;
          const isActive = i === activeIdx;
          return (
            <motion.div
              key={s.id}
              initial={reduced ? false : { opacity: 0, x: -16, filter: 'blur(6px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex items-center gap-3"
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className={`inline-block h-[2px] rounded-full transition-colors duration-500 ${
                  isActive ? 'w-6 bg-[color:var(--bd-lime)]' : 'w-3 bg-[color:var(--bd-bone)]/30'
                }`}
              />
              <KineticLabel text={s.label} isActive={isActive} reduced={!!reduced} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </aside>
  );
}

function KineticLabel({
  text,
  isActive,
  reduced,
}: {
  text: string;
  isActive: boolean;
  reduced: boolean;
}) {
  const letters = text.split('');
  return (
    <span
      className={`font-mono text-[11px] tracking-[0.35em] uppercase transition-colors duration-500 ${
        isActive ? 'text-[color:var(--bd-lime)]' : 'text-[color:var(--bd-bone)]/30'
      }`}
    >
      {letters.map((ch, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          aria-hidden
          style={{ height: '1em', lineHeight: '1em' }}
        >
          <motion.span
            initial={reduced ? false : { y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.04 * i, ease: EASE }}
            style={{ display: 'inline-block' }}
          >
            {ch}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
