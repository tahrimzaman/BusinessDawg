'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';

/**
 * DawgRail — six vertical white "thermometer" bars on the far-left edge.
 * Each bar maps to one section's scroll range; fills downward with white as
 * the user scrolls. The chapter name inside the bar is rendered as a white
 * stroked outline plus an onyx-solid copy clipped to the fill, so the name
 * visually inverts in lockstep with the fill. Clickable. Lg+ only.
 *
 * A11y: each bar is a real <button aria-label="Jump to {label}"> nested in
 * an <aside aria-label="Chapter progress">. The outer aside uses
 * `pointer-events-none` so the empty space between bars never blocks page
 * clicks; each <FillBar> button restores `pointer-events-auto` so the bars
 * remain mouse-clickable AND keyboard-focusable (Tab order, Enter/Space).
 * If you change the aside's pointer-events policy, preserve this pattern.
 */

const SECTIONS = [
  { id: 'hero', label: 'INTRO' },
  { id: 'reel', label: 'ROAST' },
  { id: 'systems', label: 'STACK' },
  { id: 'chatbot', label: 'TALK' },
  { id: 'join', label: 'JOIN' },
  { id: 'ship', label: 'SHIP' },
] as const;

export default function DawgRail() {
  // Each section's [startScroll, endScroll] range in document coordinates.
  const [ranges, setRanges] = useState<Array<[number, number]>>(() =>
    SECTIONS.map(() => [0, 1] as [number, number]),
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const { scrollY } = useScroll();

  useEffect(() => {
    function compute() {
      const tops = SECTIONS.map((s) => {
        const el = document.getElementById(s.id);
        if (!el) return 0;
        return el.getBoundingClientRect().top + window.scrollY;
      });
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const next: Array<[number, number]> = tops.map((top, i) => {
        const start = i === 0 ? 0 : top;
        const end = i < tops.length - 1 ? tops[i + 1] : Math.max(start + 1, maxScroll);
        return [start, Math.max(start + 1, end)];
      });
      setRanges(next);
    }

    // Debounced scheduler. Multiple triggers (resize, body resize, font ready,
    // late initial) all funnel through this so we never compute more than
    // once per ~150 ms.
    let debounceId: number | null = null;
    const scheduleCompute = () => {
      if (debounceId !== null) window.clearTimeout(debounceId);
      debounceId = window.setTimeout(compute, 150);
    };

    compute();

    // ResizeObserver on <body> catches every height change — dynamic imports
    // hydrating below the fold, Reveal animations expanding content, lazy
    // images loading, the Roast carousel snapping. Without this the rail
    // boundaries can stay stuck at first-paint positions and the fills land
    // on the wrong section as the user scrolls.
    const ro = new ResizeObserver(scheduleCompute);
    ro.observe(document.body);

    window.addEventListener('resize', scheduleCompute);

    // Font swap also shifts vertical rhythm. Recompute once fonts are ready.
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(scheduleCompute).catch(() => {});
    }

    // Late initial compute — belt + suspenders alongside the ResizeObserver
    // in case the body height settled before RO was attached.
    const lateId = window.setTimeout(compute, 400);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', scheduleCompute);
      if (debounceId !== null) window.clearTimeout(debounceId);
      window.clearTimeout(lateId);
    };
  }, []);

  useMotionValueEvent(scrollY, 'change', (y) => {
    for (let i = ranges.length - 1; i >= 0; i--) {
      if (y >= ranges[i][0]) {
        if (i !== activeIdx) setActiveIdx(i);
        return;
      }
    }
    if (activeIdx !== 0) setActiveIdx(0);
  });

  function jumpTo(idx: number) {
    const targetY = ranges[idx]?.[0] ?? 0;
    const lenis = (
      window as unknown as {
        __lenis?: { scrollTo: (target: number, opts?: { force?: boolean }) => void };
      }
    ).__lenis;
    if (lenis) lenis.scrollTo(targetY, { force: true });
    else window.scrollTo({ top: targetY, behavior: 'smooth' });
  }

  return (
    <aside
      aria-label="Chapter progress"
      className="pointer-events-none fixed top-[120px] bottom-[80px] left-6 z-20 hidden w-[44px] flex-col gap-[4px] lg:flex"
    >
      {SECTIONS.map((s, i) => (
        <FillBar
          key={s.id}
          label={s.label}
          range={ranges[i]}
          scrollY={scrollY}
          isActive={i === activeIdx}
          onClick={() => jumpTo(i)}
        />
      ))}
    </aside>
  );
}

function FillBar({
  label,
  range,
  scrollY,
  isActive,
  onClick,
}: {
  label: string;
  range: [number, number];
  scrollY: ReturnType<typeof useScroll>['scrollY'];
  isActive: boolean;
  onClick: () => void;
}) {
  // 0..1 progress through this section's scroll range, clamped.
  const progress = useTransform(scrollY, range, [0, 1], { clamp: true });
  const fillHeight = useTransform(progress, (v) => `${v * 100}%`);
  const clipInset = useTransform(progress, (v) => `inset(0 0 ${(1 - v) * 100}% 0)`);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Jump to ${label}`}
      className="group pointer-events-auto relative flex-1 cursor-pointer overflow-hidden p-0"
      style={{
        border: `1.5px solid color-mix(in srgb, var(--bd-bone) ${isActive ? 90 : 35}%, transparent)`,
        background: 'transparent',
        boxShadow: isActive
          ? '0 0 16px -2px color-mix(in srgb, var(--bd-bone) 35%, transparent)'
          : 'none',
        transition: 'border-color 220ms ease, box-shadow 220ms ease',
      }}
    >
      {/* White fill — grows downward */}
      <motion.div
        aria-hidden
        className="absolute top-0 left-0 w-full"
        style={{
          height: fillHeight,
          background: 'var(--bd-bone)',
        }}
      />

      {/* Base solid white text (visible outside fill) */}
      <BarText label={label} mode="base" />

      {/* Onyx text, clipped to the fill area (overlays the white inside fill) */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ clipPath: clipInset, WebkitClipPath: clipInset as unknown as string }}
      >
        <BarText label={label} mode="solid" />
      </motion.div>

      {/* Hover affordance */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          border: '1.5px solid color-mix(in srgb, var(--bd-bone) 70%, transparent)',
        }}
      />
    </button>
  );
}

function BarText({ label, mode }: { label: string; mode: 'base' | 'solid' }) {
  // Both layers render solid text now. `base` is white (visible outside the
  // fill), `solid` is onyx (overlaid inside the fill via clip-path).
  const fill = mode === 'base' ? 'var(--bd-bone)' : '#0A0A0A';

  return (
    <svg
      aria-hidden
      className="absolute inset-0"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 40 240"
    >
      <text
        x="20"
        y="120"
        textAnchor="middle"
        dominantBaseline="central"
        transform="rotate(-90 20 120)"
        fontFamily="var(--font-display, var(--font-sans, system-ui))"
        fontSize="28"
        fontWeight={900}
        fontStyle="italic"
        letterSpacing="0"
        style={{ textTransform: 'uppercase' }}
        fill={fill}
      >
        {label}
      </text>
    </svg>
  );
}
