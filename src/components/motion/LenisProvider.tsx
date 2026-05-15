'use client';

import { useEffect } from 'react';
import type LenisType from 'lenis';

/**
 * Lenis smooth-scroll, deferred and gated.
 *
 * - Only loaded on viewports >= 1024px (DawgRail is desktop-only; mobile uses
 *   native scroll, which is faster and lower CPU).
 * - Imported dynamically inside requestIdleCallback so the ~15 KB Lenis chunk
 *   never competes with hydration for the main thread.
 * - Respects prefers-reduced-motion.
 *
 * DawgRail (the one consumer of window.__lenis) null-checks before calling
 * scrollTo, so if Lenis hasn't loaded yet a click falls through to the
 * browser's native smooth-scroll. Acceptable.
 */
export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(min-width: 1024px)').matches) return;

    let lenis: LenisType | null = null;
    let rafId: number | null = null;
    let cancelled = false;

    const start = async () => {
      const { default: Lenis } = await import('lenis');
      if (cancelled) return;

      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      (window as unknown as { __lenis?: LenisType }).__lenis = lenis;

      const raf = (time: number) => {
        if (!lenis) return;
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    };

    type IdleScheduler = (cb: IdleRequestCallback, opts?: { timeout?: number }) => number;
    const ric: IdleScheduler | undefined = (
      window as unknown as { requestIdleCallback?: IdleScheduler }
    ).requestIdleCallback;
    const handle = ric
      ? ric(() => void start(), { timeout: 2000 })
      : (window.setTimeout(() => void start(), 0) as unknown as number);

    return () => {
      cancelled = true;
      const cic = (window as unknown as { cancelIdleCallback?: (h: number) => void })
        .cancelIdleCallback;
      if (ric && cic) cic(handle);
      else window.clearTimeout(handle);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
      (window as unknown as { __lenis?: LenisType }).__lenis = undefined;
    };
  }, []);

  return <>{children}</>;
}
