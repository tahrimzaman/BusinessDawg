'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useReadySignals } from '@/lib/preloader/useReadySignals';
import {
  BOOT_LINES,
  GLITCH_DURATION,
  LINE_INTERVAL,
  MAX_DURATION,
  MIN_VISIBLE,
  REDUCED_FADE,
  THRESHOLD,
} from '@/lib/preloader/constants';

/**
 * Preloader — content-driven homepage loading screen.
 *
 * A brandless black cover is painted before first paint by the bd-intro-gate
 * script (see layout.tsx). This component decides what happens next:
 *  - page ready within THRESHOLD  → reveal silently, no cinematic (fast path)
 *  - page still loading after that → play the "system boot" cinematic until
 *    contents are ready, then a glitch-cut reveal
 * Reduced motion gets a static boot panel (no typing/scanline/glitch).
 */
type Phase = 'idle' | 'bare' | 'boot' | 'revealing' | 'done';

function getLenis(): { stop: () => void; start: () => void } | undefined {
  return (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
}

export default function Preloader() {
  // Decided at first render: a soft-nav into "/" never sets the pre-paint
  // cover, so there's nothing to do. Both 'bare' and 'done' render null, so
  // the client initializer can't mismatch the server's 'idle'.
  const [phase, setPhase] = useState<Phase>(() => {
    if (typeof document === 'undefined') return 'idle';
    return document.documentElement.classList.contains('bd-intro-pending') ? 'bare' : 'done';
  });
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [visibleLines, setVisibleLines] = useState(0);

  const count = useMotionValue(0);
  const counterText = useTransform(count, (v) =>
    String(Math.min(100, Math.round(v))).padStart(2, '0'),
  );
  const barWidth = useTransform(count, [0, 100], ['0%', '100%']);

  const revealedRef = useRef(false);
  const bootShownAtRef = useRef(0);

  const active = phase === 'bare' || phase === 'boot';
  const ready = useReadySignals(active);

  // Hand the page back: drop the CSS cover, restore scroll, reveal.
  const reveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    document.documentElement.classList.remove('bd-intro-pending');
    getLenis()?.start();
    setPhase((p) => {
      if (p === 'boot') {
        animate(count, 100, { duration: 0.18, ease: 'easeOut' });
        return 'revealing';
      }
      return 'done';
    });
  }, [count]);

  // Lock Lenis smooth-scroll while the loader is up (body overflow is held by
  // the .bd-intro-pending CSS); reveal() hands scrolling back.
  useEffect(() => {
    if (phase === 'bare' || phase === 'boot') getLenis()?.stop();
  }, [phase]);

  // Bare cover: reveal fast if ready, else escalate to the boot cinematic.
  useEffect(() => {
    if (phase !== 'bare') return;
    if (ready) {
      reveal();
      return;
    }
    const t = setTimeout(() => {
      if (!revealedRef.current) {
        bootShownAtRef.current = performance.now();
        setPhase('boot');
      }
    }, THRESHOLD * 1000);
    return () => clearTimeout(t);
  }, [phase, ready, reveal]);

  // Boot cinematic: type lines + ease the counter (skipped under reduced
  // motion, which renders every line statically — see linesToRender below).
  useEffect(() => {
    if (phase !== 'boot' || reduced) return;
    const lineTimer = setInterval(
      () => setVisibleLines((n) => Math.min(n + 1, BOOT_LINES.length)),
      LINE_INTERVAL,
    );
    const controls = animate(count, 92, { duration: 2.6, ease: 'easeOut' });
    return () => {
      clearInterval(lineTimer);
      controls.stop();
    };
  }, [phase, reduced, count]);

  // Boot → reveal once ready, holding the minimum visible time.
  useEffect(() => {
    if (phase !== 'boot' || !ready) return;
    const remaining = MIN_VISIBLE * 1000 - (performance.now() - bootShownAtRef.current);
    const t = setTimeout(reveal, Math.max(0, remaining));
    return () => clearTimeout(t);
  }, [phase, ready, reveal]);

  // Hard fail-safe — the loader can never permanently hide the site.
  useEffect(() => {
    if (phase !== 'bare' && phase !== 'boot') return;
    const t = setTimeout(reveal, MAX_DURATION * 1000);
    return () => clearTimeout(t);
  }, [phase, reveal]);

  // bfcache restore that lands mid-load: force the reveal.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted && !revealedRef.current && phase !== 'done') reveal();
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, [phase, reveal]);

  // Revealing → done. Timer-driven, not onAnimationComplete — a backgrounded
  // tab freezes requestAnimationFrame (and Framer's animation events), so the
  // overlay must tear down on a timer or it would hang until the tab refocuses.
  useEffect(() => {
    if (phase !== 'revealing') return;
    const dur = (reduced ? REDUCED_FADE : GLITCH_DURATION) * 1000;
    const t = setTimeout(() => setPhase('done'), dur + 80);
    return () => clearTimeout(t);
  }, [phase, reduced]);

  if (phase !== 'boot' && phase !== 'revealing') return null;

  const glitching = phase === 'revealing' && !reduced;
  // Reduced motion shows every boot line at once (no typing animation).
  const linesToRender = reduced ? BOOT_LINES.length : visibleLines;

  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black"
      initial={false}
      animate={
        phase === 'revealing'
          ? reduced
            ? { opacity: 0 }
            : { opacity: [1, 1, 0, 1, 0], x: [0, -5, 4, -2, 0] }
          : { opacity: 1 }
      }
      transition={
        phase === 'revealing'
          ? {
              duration: reduced ? REDUCED_FADE : GLITCH_DURATION,
              ease: 'linear',
              times: reduced ? undefined : [0, 0.32, 0.46, 0.74, 1],
            }
          : { duration: 0 }
      }
    >
      {/* Terminal panel */}
      <div className="w-full max-w-md px-7 font-mono">
        {/* Header */}
        <div className="text-bone/90 mb-7 flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase">
          <span className="bg-lime inline-block h-2 w-2 rounded-full" />
          BusinessDawg
        </div>

        {/* Boot log */}
        <div className="space-y-1.5 text-[12px] leading-relaxed sm:text-[13px]">
          {BOOT_LINES.slice(0, linesToRender).map((line, i) => (
            <motion.div
              key={i}
              initial={reduced ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex items-baseline gap-2"
            >
              <span className="text-lime/60">{'>'}</span>
              <span className="text-bone/75">{line.label}</span>
              {line.status ? (
                <>
                  <span className="border-bone/15 flex-1 -translate-y-[3px] border-b border-dotted" />
                  <span className="text-lime tracking-widest">{line.status}</span>
                </>
              ) : null}
              {i === linesToRender - 1 && phase === 'boot' && !reduced ? (
                <span className="bd-boot-cursor bg-lime ml-1 inline-block h-3 w-2" />
              ) : null}
            </motion.div>
          ))}
        </div>

        {/* Progress — animated bar for full motion, static label for reduced */}
        {reduced ? (
          <p className="text-bone/40 mt-7 text-[12px] tracking-wide">loading…</p>
        ) : (
          <div className="mt-7 flex items-center gap-3">
            <div className="relative h-[2px] flex-1 overflow-hidden bg-white/10">
              <motion.div
                className="bg-lime absolute inset-y-0 left-0"
                style={{ width: barWidth }}
              />
            </div>
            <motion.span className="text-bone/65 w-9 text-right text-[11px] tabular-nums">
              {counterText}
            </motion.span>
          </div>
        )}
      </div>

      {/* Scanline + grain overlays (motion-gated in CSS) */}
      {!reduced ? (
        <>
          <div aria-hidden className="bd-boot-scanlines pointer-events-none" />
          <div aria-hidden className="bd-boot-grain pointer-events-none absolute inset-0" />
        </>
      ) : null}

      {/* Glitch RGB-split flash on reveal */}
      {glitching ? (
        <motion.div
          aria-hidden
          className="bg-lime/10 pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0, 0.4, 0] }}
          transition={{ duration: GLITCH_DURATION, ease: 'linear' }}
        />
      ) : null}
    </motion.div>
  );
}
