'use client';
/**
 * Hidden dev-only tweak state. Renders a panel (TweakPanel.tsx) when
 * NEXT_PUBLIC_TWEAKS=1 or ?tweaks=1 is in the URL. Components consume
 * these values via useTweaks() to A/B mascot scale, pacing, hero layout.
 *
 * Zero footprint in prod: this module is dynamically imported by
 * TweakPanel and useTweaks() always returns the defaults when no panel
 * has mounted.
 */
import { useSyncExternalStore } from 'react';

export type MascotScale = 'hero' | 'giant' | 'editorial';
export type PaceMul = 1 | 1.3 | 1.6;
export type HeroComp = 'split' | 'overlap' | 'stacked';

export type TweaksState = {
  mascotScale: MascotScale;
  pace: PaceMul;
  heroComp: HeroComp;
};

const DEFAULTS: TweaksState = {
  mascotScale: 'hero',
  pace: 1,
  heroComp: 'split',
};

const KEY = 'bd-tweaks-v1';

let state: TweaksState = (() => {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
})();

const listeners = new Set<() => void>();

function emit() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }
  listeners.forEach((l) => l());
}

export function setTweaks(patch: Partial<TweaksState>) {
  state = { ...state, ...patch };
  emit();
}

export function getTweaks(): TweaksState {
  return state;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useTweaks(): TweaksState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => DEFAULTS,
  );
}

export function isTweaksEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_TWEAKS === '1') return true;
  if (typeof window === 'undefined') return false;
  // Auto-on in local dev — localhost / 127.0.0.1 / *.local.
  const host = window.location.hostname;
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local')
  ) {
    return true;
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('tweaks') === '1';
}
