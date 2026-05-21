/**
 * Preloader tokens.
 *
 * The loading screen's visuals are server-rendered markup animated purely in
 * CSS (so they show during a slow JS download). These are the only values the
 * React controller — which just decides when to reveal — still needs.
 */

/** React-side fail-safe — reveal even if readiness never resolves (seconds). */
export const MAX_DURATION = 8;

/** Reveal (CRT power-off) length — the controller unmounts after this (seconds). */
export const REVEAL_DURATION = 0.5;

/**
 * System-boot log — rendered as static markup and revealed by staggered CSS
 * animation. Mirrors the five Systems Stack offerings, so the loader reads as
 * the machine booting up.
 */
export const BOOT_LINES = [
  { label: 'initializing businessdawg', status: '' },
  { label: 'branding systems', status: 'ok' },
  { label: 'ai automation', status: 'ok' },
  { label: 'web & product', status: 'ok' },
  { label: 'growth systems', status: 'ok' },
  { label: 'marketing infra', status: 'ok' },
  { label: 'compiling business machine', status: '' },
] as const;
