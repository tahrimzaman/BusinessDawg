/**
 * Preloader tokens — timings + boot copy for the homepage loading screen.
 *
 * The loader is purely content-driven: a brandless black cover is painted
 * before first paint, and the "system boot" cinematic only renders if the
 * page isn't ready within THRESHOLD. Fast loads reveal silently.
 */

/** Below this (seconds since the cover went up), no cinematic — reveal silently. */
export const THRESHOLD = 0.25;

/** Once the cinematic is shown, keep it on screen at least this long (seconds). */
export const MIN_VISIBLE = 0.5;

/** Hard fail-safe — the loader always reveals by now (seconds). */
export const MAX_DURATION = 8;

/** Glitch-cut reveal duration (seconds). */
export const GLITCH_DURATION = 0.32;

/** Reduced-motion path: a plain crossfade out of the bare cover (seconds). */
export const REDUCED_FADE = 0.15;

/** Cadence at which boot lines type in (ms). */
export const LINE_INTERVAL = 180;

/**
 * System-boot log — each line "completes" as it appears; the final line stays
 * live (cursor blinking) while the page finishes loading. Mirrors the five
 * Systems Stack offerings, so the loader reads as the machine booting up.
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
