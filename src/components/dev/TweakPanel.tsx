'use client';

import { useState, useSyncExternalStore } from 'react';
import {
  isTweaksEnabled,
  setTweaks,
  useTweaks,
  type HeroComp,
  type MascotScale,
  type PaceMul,
} from '@/lib/dev/tweaks';

function subscribeNoop() {
  return () => {};
}
function useClientEnabled() {
  return useSyncExternalStore(
    subscribeNoop,
    () => isTweaksEnabled(),
    () => false,
  );
}

/**
 * Hidden dev-only tweak panel. Active when:
 *   - NEXT_PUBLIC_TWEAKS=1
 *   - or ?tweaks=1 in the URL
 *
 * Lets Tahrim A/B mascot scale, pacing multiplier, and hero composition
 * without re-deploying.
 */
export default function TweakPanel() {
  const enabled = useClientEnabled();
  const [collapsed, setCollapsed] = useState(false);
  const t = useTweaks();

  if (!enabled) return null;

  return (
    <div className="fixed right-4 bottom-4 z-[200] w-64 rounded-2xl border border-[color:var(--bd-lime)]/40 bg-black/85 p-4 font-mono text-[11px] text-[color:var(--bd-bone)] shadow-2xl backdrop-blur-lg">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between tracking-widest text-[color:var(--bd-lime)] uppercase"
      >
        <span>/ Tweaks</span>
        <span>{collapsed ? '+' : '−'}</span>
      </button>

      {!collapsed ? (
        <div className="mt-4 space-y-4">
          <Row label="Mascot scale">
            {(['hero', 'giant', 'editorial'] as MascotScale[]).map((v) => (
              <Pill
                key={v}
                active={t.mascotScale === v}
                onClick={() => setTweaks({ mascotScale: v })}
              >
                {v}
              </Pill>
            ))}
          </Row>
          <Row label="Pacing ×">
            {([1, 1.3, 1.6] as PaceMul[]).map((v) => (
              <Pill key={v} active={t.pace === v} onClick={() => setTweaks({ pace: v })}>
                {v}×
              </Pill>
            ))}
          </Row>
          <Row label="Hero comp">
            {(['split', 'overlap', 'stacked'] as HeroComp[]).map((v) => (
              <Pill key={v} active={t.heroComp === v} onClick={() => setTweaks({ heroComp: v })}>
                {v}
              </Pill>
            ))}
          </Row>
          <p className="pt-1 text-[10px] tracking-widest text-[color:var(--bd-bone)]/40 uppercase">
            Saved in localStorage · Refresh keeps state
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 tracking-widest text-[color:var(--bd-bone)]/60 uppercase">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 transition-colors ${
        active
          ? 'border-[color:var(--bd-lime)] bg-[color:var(--bd-lime)] text-[color:var(--bd-ink)]'
          : 'border-white/20 text-[color:var(--bd-bone)]/80 hover:border-[color:var(--bd-lime)]/50'
      }`}
    >
      {children}
    </button>
  );
}
