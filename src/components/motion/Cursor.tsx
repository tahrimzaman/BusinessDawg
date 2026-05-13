'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Minimal custom cursor — small ring + lime dot. Never blanks out.
 *
 * Design contract:
 *  - The native cursor is hidden ONLY after this component mounts successfully
 *    on a non-touch, non-reduced-motion device. We add `bd-cursor-on` to <html>
 *    so the CSS rule in globals.css can find it. If JS fails, the class never
 *    gets added → native cursor is always visible.
 *  - The ring is always rendered, just `display:none` until enabled. This is
 *    deliberate — earlier versions early-returned `null` and then tried to
 *    read refs inside the same effect that flipped `enabled`, which crashed
 *    with `Cannot read properties of null (reading 'style')` on first paint.
 *  - On `[data-cursor="dawg"]` elements we just scale + recolor the ring.
 *    We never swap to a Mascot SVG (the previous version did; if positioning
 *    failed the cursor went blank).
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  // Effect 1 — capability detection. Runs once, flips `enabled` and adds the
  // <html class> that turns off the native cursor.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touch = window.matchMedia('(pointer: coarse)').matches;
    if (reduced || touch) return;
    document.documentElement.classList.add('bd-cursor-on');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe mount flag
    setEnabled(true);
    return () => {
      document.documentElement.classList.remove('bd-cursor-on');
    };
  }, []);

  // Effect 2 — animation + listeners. Runs *after* `enabled` flips, so the
  // ring/dot divs are already mounted and their refs are attached.
  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = -100,
      my = -100,
      rx = -100,
      ry = -100;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dot.style.transform = `translate3d(${mx - 4}px, ${my - 4}px, 0)`;
      ring.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    let raf = requestAnimationFrame(tick);

    const onOver = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      setActive(Boolean(t.closest('[data-cursor="dawg"]')));
    };

    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerover', onOver);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
    };
  }, [enabled]);

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[9998] h-9 w-9 transition-[scale,border-color,background-color] duration-200"
        style={{
          display: enabled ? 'block' : 'none',
          scale: active ? '1.6' : '1',
        }}
      >
        <div
          className="h-full w-full rounded-full border"
          style={{
            borderColor: active ? 'var(--bd-lime)' : 'rgba(250,250,250,0.45)',
            background: active
              ? 'color-mix(in srgb, var(--bd-lime) 12%, transparent)'
              : 'transparent',
          }}
        />
      </div>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-2 w-2 rounded-full transition-[opacity] duration-200"
        style={{
          display: enabled ? 'block' : 'none',
          background: 'var(--bd-lime)',
          opacity: active ? 0 : 1,
        }}
      />
    </>
  );
}
