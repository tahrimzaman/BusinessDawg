/**
 * Pacing tokens for the cinematic redesign.
 * Use these instead of raw `duration: 0.X` literals so the whole site
 * responds to the dev TweakPanel's pacing multiplier.
 */
export const TIMING = {
  reveal: 0.8,
  revealLate: 0.9,
  hero: 0.85,
  microFast: 0.18,
  microSlow: 0.4,
} as const;

export const STAGGER_SLOW = 0.09;

export type Pace = 'normal' | 'late' | 'hero';

export function paceDuration(pace: Pace = 'normal') {
  switch (pace) {
    case 'hero':
      return TIMING.hero;
    case 'late':
      return TIMING.revealLate;
    default:
      return TIMING.reveal;
  }
}
