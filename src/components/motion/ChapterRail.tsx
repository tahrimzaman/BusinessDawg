'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * ChapterRail — floating glass pill on the left edge that shows page-section
 * progress and lets the user jump to any section. Desktop-only (hidden < lg).
 *
 * Active section detected from real element rects (whichever section straddles
 * the viewport mid-line) so MemeReel's 500vh doesn't break the indicator.
 */
const CHAPTERS = [
  { id: 'hero', label: 'BUILD' },
  { id: 'reel', label: 'ROAST' },
  { id: 'systems', label: 'STACK' },
  { id: 'chatbot', label: 'TALK' },
  { id: 'join', label: 'JOIN' },
  { id: 'ship', label: 'SHIP' },
] as const;

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (
    window as unknown as {
      __lenis?: {
        scrollTo: (t: HTMLElement, o?: { offset?: number; duration?: number }) => void;
      };
    }
  ).__lenis;
  if (lenis?.scrollTo) {
    lenis.scrollTo(el, { offset: -60, duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export default function ChapterRail() {
  const reduced = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    function recompute() {
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < CHAPTERS.length; i++) {
        const el = document.getElementById(CHAPTERS[i].id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) {
          best = i;
          bestDist = -1;
          continue;
        }
        if (bestDist < 0) continue;
        const d = Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      setActiveIdx(best);
    }
    recompute();
    window.addEventListener('scroll', recompute, { passive: true });
    window.addEventListener('resize', recompute);
    return () => {
      window.removeEventListener('scroll', recompute);
      window.removeEventListener('resize', recompute);
    };
  }, []);

  const indicatorTransition = reduced
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 90, damping: 20 };

  // Indicator y-position: snap to active row. Rows are evenly distributed by
  // `gap-4` in a flex column, so we tween between (activeIdx / (n-1)) * 100%.
  const indicatorTop = `${(activeIdx / (CHAPTERS.length - 1)) * 100}%`;

  return (
    <nav
      aria-label="Section navigation"
      className="pointer-events-none fixed top-1/2 left-4 z-30 hidden -translate-y-1/2 lg:block"
    >
      <div className="glass pointer-events-auto rounded-3xl border border-[color:var(--bd-lime)]/15 px-3 py-4 shadow-[0_6px_30px_rgba(0,0,0,0.45)]">
        <ul className="relative flex flex-col gap-4">
          {/* Lime indicator bar — snaps to active row */}
          <motion.span
            aria-hidden
            className="absolute left-0 h-5 w-[2px] -translate-y-1/2 rounded-full bg-[color:var(--bd-lime)]"
            style={{
              boxShadow: '0 0 10px 1px color-mix(in srgb, var(--bd-lime) 55%, transparent)',
            }}
            animate={{ top: indicatorTop }}
            transition={indicatorTransition}
          />

          {CHAPTERS.map((c, i) => {
            const active = i === activeIdx;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => scrollToId(c.id)}
                  className={`flex items-center gap-3 pl-3 font-mono text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 ${active ? 'text-[color:var(--bd-lime)]' : 'text-[color:var(--bd-bone)]/40 hover:text-[color:var(--bd-bone)]/80'}`}
                  aria-label={`Jump to ${c.label}`}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full transition-colors duration-300 ${active ? 'bg-[color:var(--bd-lime)]' : 'bg-[color:var(--bd-bone)]/30'}`}
                  />
                  <span>{c.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
