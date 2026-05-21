'use client';

import { useEffect, useState } from 'react';

/**
 * Resolves true when the homepage's above-fold contents are ready — fonts
 * loaded, the hero mascot image decoded, and the DOM parsed. The preloader is
 * purely content-driven, so this is the signal that decides when (and whether)
 * the loading screen reveals.
 */
const HERO_IMAGE = '/brand/mascot-pos-1.webp';

export function useReadySignals(active: boolean): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const fonts = (): Promise<unknown> =>
      'fonts' in document ? document.fonts.ready.catch(() => undefined) : Promise.resolve();

    const heroImage = (): Promise<unknown> =>
      new Promise((resolve) => {
        const img = new Image();
        const done = () => resolve(undefined);
        // `load` fires reliably even in a backgrounded tab; img.decode() can
        // hang there, so it's deliberately not used as the gating signal.
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
        img.src = HERO_IMAGE;
        if (img.complete) done();
      });

    const domReady = (): Promise<unknown> =>
      document.readyState !== 'loading'
        ? Promise.resolve()
        : new Promise((resolve) =>
            document.addEventListener('DOMContentLoaded', () => resolve(undefined), {
              once: true,
            }),
          );

    Promise.all([fonts(), heroImage(), domReady()]).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [active]);

  return ready;
}
