/**
 * Pacing tokens for the cinematic redesign.
 * Use these instead of raw `duration: 0.X` literals so the whole site
 * responds to the dev TweakPanel's pacing multiplier.
 */
export const TIMING = {
  reveal: 1.3,
  revealLate: 1.5,
  hero: 1.4,
  microFast: 0.25,
  microSlow: 0.6,
} as const;

export const STAGGER_SLOW = 0.15;

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
