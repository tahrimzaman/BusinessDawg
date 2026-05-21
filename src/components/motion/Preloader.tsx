'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useReadySignals } from '@/lib/preloader/useReadySignals';
import { BOOT_LINES, MAX_DURATION, REVEAL_DURATION } from '@/lib/preloader/constants';

/**
 * Preloader — content-driven homepage loading screen (controller).
 *
 * The loading screen itself (#bd-loader) is plain markup rendered here and
 * therefore server-rendered into the homepage HTML; every visual is animated
 * by CSS (see globals.css). That means the screen appears on first paint and
 * stays visible through a slow JS download — it does not wait on the bundle.
 *
 * This component's only job is timing: detect when the page's contents are
 * ready, then trigger the CSS glitch-out reveal and unmount. On a fast load it
 * reveals within ~150ms — before the CSS panel's 220ms fade-in — so a quick
 * connection shows nothing perceptible.
 */
type Phase = 'loading' | 'revealing' | 'done';

function getLenis(): { stop: () => void; start: () => void } | undefined {
  return (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
}

export default function Preloader() {
  // Decided at first render (no setState-in-effect): a soft-nav into "/" never
  // runs the inline gate script, so the cover class is absent and there's
  // nothing to do. The server always renders 'loading', and a soft-nav has no
  // server render to mismatch — so this initializer can't break hydration.
  const [phase, setPhase] = useState<Phase>(() => {
    if (typeof document === 'undefined') return 'loading';
    return document.documentElement.classList.contains('bd-intro-pending') ? 'loading' : 'done';
  });
  const revealedRef = useRef(phase === 'done');
  const ready = useReadySignals(phase === 'loading');

  const reveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    getLenis()?.start();
    setPhase('revealing');
  }, []);

  // Lock Lenis smooth-scroll while the loader is up; reveal() restores it.
  useEffect(() => {
    if (phase === 'loading') getLenis()?.stop();
  }, [phase]);

  // Reveal as soon as the page's contents are ready.
  useEffect(() => {
    if (phase === 'loading' && ready) reveal();
  }, [phase, ready, reveal]);

  // Fail-safe — reveal even if a readiness signal never resolves.
  useEffect(() => {
    if (phase !== 'loading') return;
    const t = setTimeout(reveal, MAX_DURATION * 1000);
    return () => clearTimeout(t);
  }, [phase, reveal]);

  // bfcache restore that lands mid-load: force the reveal.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted && !revealedRef.current) reveal();
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, [reveal]);

  // Revealing → done. Timer-driven (not an animation event) so a backgrounded
  // tab — where requestAnimationFrame and animation events freeze — still
  // tears the screen down and unlocks scrolling.
  useEffect(() => {
    if (phase !== 'revealing') return;
    const t = setTimeout(
      () => {
        document.documentElement.classList.remove('bd-intro-pending');
        setPhase('done');
      },
      REVEAL_DURATION * 1000 + 60,
    );
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div id="bd-loader" aria-hidden className={phase === 'revealing' ? 'bd-loader-out' : undefined}>
      <div className="bd-loader-panel">
        <div className="bd-loader-head">
          <span className="bd-loader-dot" />
          BusinessDawg
        </div>

        <div className="bd-loader-log">
          {BOOT_LINES.map((line, i) => (
            <div
              key={i}
              className="bd-loader-line"
              style={{ animationDelay: `${0.4 + i * 0.13}s` }}
            >
              <span className="bd-loader-caret">{'>'}</span>
              <span className="bd-loader-label">{line.label}</span>
              {line.status ? (
                <>
                  <span className="bd-loader-leader" />
                  <span className="bd-loader-ok">{line.status}</span>
                </>
              ) : null}
              {i === BOOT_LINES.length - 1 ? <span className="bd-loader-cursor" /> : null}
            </div>
          ))}
        </div>

        <div className="bd-loader-bar">
          <span className="bd-loader-fill" />
          <span className="bd-loader-pct" />
        </div>
      </div>

      <div className="bd-loader-scanlines" />
      <div className="bd-loader-grain" />
    </div>
  );
}
