'use client';

import { useEffect, useRef, useState } from 'react';
import Mascot from '@/components/brand/Mascot';

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touch = window.matchMedia('(pointer: coarse)').matches;
    if (reduced || touch) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard SSR-safe mount pattern
    setEnabled(true);

    const dot = dotRef.current!;
    const ring = ringRef.current!;
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
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[9998] flex h-9 w-9 items-center justify-center transition-[opacity,scale] duration-200"
        style={{
          opacity: active ? 1 : 0.4,
          scale: active ? '1.6' : '1',
        }}
      >
        {active ? (
          <Mascot pose="idle" size={48} />
        ) : (
          <div className="h-full w-full rounded-full border border-[color:var(--bd-bone)]/40" />
        )}
      </div>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-2 w-2 rounded-full"
        style={{ background: 'var(--bd-lime)', opacity: active ? 0 : 1 }}
      />
    </>
  );
}
