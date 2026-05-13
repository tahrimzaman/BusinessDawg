'use client';

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useState } from 'react';

/**
 * ChapterRail — fixed left + right vertical rails that show scroll progress
 * across the page, with clickable chapter labels that smooth-scroll to each
 * anchored section. Desktop-only (hidden < lg). The rail is the page's
 * persistent scroll signature.
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
      __lenis?: { scrollTo: (t: HTMLElement, o?: { offset?: number; duration?: number }) => void };
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
  const { scrollYProgress } = useScroll();
  // Smoother visual motion for the dot/percent without a spring under reduced motion.
  const smoothed = useSpring(
    scrollYProgress,
    reduced
      ? { stiffness: 1000, damping: 100, mass: 0 }
      : { stiffness: 80, damping: 22, mass: 0.6 },
  );

  const dotY = useTransform(smoothed, [0, 1], ['0%', '100%']);

  const [activeIdx, setActiveIdx] = useState(0);
  const [pct, setPct] = useState('000');

  useMotionValueEvent(smoothed, 'change', (v) => {
    const i = Math.min(CHAPTERS.length - 1, Math.max(0, Math.floor(v * CHAPTERS.length)));
    setActiveIdx(i);
    setPct(
      Math.round(v * 100)
        .toString()
        .padStart(3, '0'),
    );
  });

  return (
    <>
      {/* Left rail — chapter labels + traveling dot (clickable nav) */}
      <nav
        aria-label="Section navigation"
        className="pointer-events-none fixed top-0 bottom-0 left-4 z-30 hidden w-16 lg:flex"
      >
        <div className="relative mx-auto h-full w-full">
          {/* Vertical line */}
          <span className="absolute top-[12%] bottom-[12%] left-1/2 w-px -translate-x-1/2 bg-[color:var(--bd-lime)]/20" />

          {/* Traveling dot */}
          <motion.span
            className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[color:var(--bd-lime)]"
            style={{
              top: dotY,
              boxShadow: '0 0 10px 2px color-mix(in srgb, var(--bd-lime) 55%, transparent)',
            }}
          />

          {/* Chapter labels evenly distributed top->bottom between 12% and 88% */}
          <div className="absolute inset-y-[12%] right-0 left-0 flex flex-col justify-between">
            {CHAPTERS.map((c, i) => {
              const active = i === activeIdx;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => scrollToId(c.id)}
                  className="group pointer-events-auto flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase"
                  aria-label={`Jump to ${c.label}`}
                >
                  <span
                    className={`h-px transition-all duration-300 ${active ? 'w-4 bg-[color:var(--bd-lime)]' : 'w-2 bg-[color:var(--bd-lime)]/30'} group-hover:w-4 group-hover:bg-[color:var(--bd-lime)]`}
                  />
                  <span
                    className={`transition-colors duration-300 ${active ? 'text-[color:var(--bd-lime)]' : 'text-[color:var(--bd-lime)]/40'} group-hover:text-[color:var(--bd-lime)]`}
                  >
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Right rail — readout (section number / percent / current label) */}
      <aside
        aria-hidden
        className="pointer-events-none fixed top-0 right-4 bottom-0 z-30 hidden w-24 lg:flex"
      >
        <div className="relative mx-auto h-full w-full">
          {/* Vertical line */}
          <span className="absolute top-[12%] bottom-[12%] left-1/2 w-px -translate-x-1/2 bg-[color:var(--bd-lime)]/20" />

          {/* Mirrored traveling tick on the right line */}
          <motion.span
            className="absolute left-1/2 h-px w-3 -translate-x-1/2 bg-[color:var(--bd-lime)]"
            style={{ top: dotY }}
          />

          {/* Readout panel — vertically centered */}
          <div className="absolute top-1/2 right-2 -translate-y-1/2 text-right font-mono uppercase">
            <p className="text-[10px] tracking-[0.3em] text-[color:var(--bd-lime)]/60">
              {(activeIdx + 1).toString().padStart(2, '0')} /{' '}
              {CHAPTERS.length.toString().padStart(2, '0')}
            </p>
            <p className="mt-1 text-[10px] tracking-[0.3em] text-[color:var(--bd-lime)]">{pct}%</p>
            <p className="mt-1 text-[10px] tracking-[0.3em] text-[color:var(--bd-lime)]/40">
              / {CHAPTERS[activeIdx].label}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
