'use client';

import { useReducedMotion } from 'framer-motion';

/**
 * VerticalMarquee — ambient left-edge text strip that drifts upward.
 * Desktop-only (hidden < lg). Replaces the deleted ChapterRail. Pure CSS
 * keyframe loop on two stacked text blocks for seamless looping.
 */
const PHRASE = 'WE BUILD • WE SHIP • ';

export default function VerticalMarquee() {
  const reduced = useReducedMotion();
  const animClass = reduced ? '' : 'animate-bd-marquee-up';
  const block = PHRASE.repeat(20);

  return (
    <aside
      aria-hidden
      className="pointer-events-none fixed top-0 bottom-0 left-3 z-20 hidden w-6 overflow-hidden lg:flex lg:items-stretch"
    >
      <div
        className={`flex flex-col ${animClass}`}
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        <span className="block font-mono text-[10px] tracking-[0.4em] whitespace-nowrap text-[color:var(--bd-lime)]/30 uppercase">
          {block}
        </span>
        <span
          aria-hidden
          className="block font-mono text-[10px] tracking-[0.4em] whitespace-nowrap text-[color:var(--bd-lime)]/30 uppercase"
        >
          {block}
        </span>
      </div>
    </aside>
  );
}
