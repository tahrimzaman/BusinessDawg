/**
 * Badge — small mono-cap pill primitive.
 *
 * Matches the pill style from the audit dashboard and the admin pipeline
 * stage chips. Server component; no client APIs.
 *
 * Variants:
 *   - pro: lime border + lime text (positive signal — Pros, Active stage)
 *   - con: signal-red border + signal-red text (negative signal — Cons)
 *   - severity:high/med/low: severity ramps for findings, deficiencies,
 *     priority chips
 *   - neutral: grey border, grey text (default category labels)
 */

import type { ReactNode } from 'react';

type Variant = 'pro' | 'con' | 'high' | 'med' | 'low' | 'neutral';

type Props = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

const BASE =
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-[0.04em]';

const VARIANTS: Record<Variant, string> = {
  pro: 'border-[color:var(--ok,#7fe26b)] text-[color:var(--ok,#7fe26b)]',
  con: 'border-[color:var(--bd-signal,#ff4d4d)] text-[color:var(--bd-signal,#ff4d4d)]',
  high: 'border-[color:var(--bd-signal,#ff4d4d)] text-[color:var(--bd-signal,#ff4d4d)]',
  med: 'border-[color:var(--warn,#ffb43d)] text-[color:var(--warn,#ffb43d)]',
  low: 'border-[color:var(--bd-grey-700,#3a3a3a)] text-[color:var(--bd-grey-300,#b8b8b8)]',
  neutral: 'border-[color:var(--bd-grey-700,#3a3a3a)] text-[color:var(--bd-grey-300,#b8b8b8)]',
};

export default function Badge({ children, variant = 'neutral', className = '' }: Props) {
  return (
    <span className={[BASE, VARIANTS[variant], className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}
