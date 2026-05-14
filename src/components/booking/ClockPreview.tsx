'use client';

/**
 * Live preview card under the time chips — renders an SVG analog clock whose
 * hands sweep to the hovered/selected time, plus a digital readout in the
 * visitor's tz. Falls back to muted hands at 12:00 with "Pick a time →" when
 * nothing is set. Respects prefers-reduced-motion: hands snap, no sweep.
 */

import { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { Slot } from './SlotList';

type Props = {
  slot: Slot | null;
  visitorTz: string;
};

function getHoursMinutes(date: Date, tz: string): { h: number; m: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(date);
  const h = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
  const m = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
  return { h, m };
}

export default function ClockPreview({ slot, visitorTz }: Props) {
  const reduced = useReducedMotion();
  const placeholder = !slot;

  const { h, m } = useMemo(() => {
    if (!slot) return { h: 12, m: 0 };
    return getHoursMinutes(new Date(slot.startUtc), visitorTz);
  }, [slot, visitorTz]);

  const hourAngle = (h % 12) * 30 + m * 0.5;
  const minuteAngle = m * 6;

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: visitorTz,
        hour: 'numeric',
        minute: '2-digit',
      }),
    [visitorTz],
  );

  const timeLabel = slot ? fmt.format(new Date(slot.startUtc)) : '—:—';
  const tzLabel = visitorTz.replace(/_/g, ' ');
  const transition = reduced ? 'none' : 'transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)';

  return (
    <div
      className={
        'flex items-center gap-4 rounded-2xl border bg-[color:var(--bd-ink)] p-4 ' +
        (placeholder ? 'border-white/10' : 'border-[color:var(--bd-lime)]/25')
      }
    >
      <ClockSvg
        hourAngle={hourAngle}
        minuteAngle={minuteAngle}
        transition={transition}
        muted={placeholder}
      />
      <div className="min-w-0">
        <p
          className={
            'font-mono text-[10px] tracking-widest uppercase ' +
            (placeholder ? 'text-[color:var(--bd-bone)]/40' : 'text-[color:var(--bd-lime)]')
          }
        >
          / Preview
        </p>
        {placeholder ? (
          <p className="font-display mt-1 text-lg font-bold text-[color:var(--bd-bone)]/50 italic">
            Pick a time →
          </p>
        ) : (
          <>
            <p className="font-display mt-1 truncate text-xl font-bold text-[color:var(--bd-bone)] italic sm:text-2xl">
              {timeLabel}
            </p>
            <p className="truncate text-xs text-[color:var(--bd-bone)]/65 sm:text-sm">{tzLabel}</p>
          </>
        )}
      </div>
    </div>
  );
}

function ClockSvg({
  hourAngle,
  minuteAngle,
  transition,
  muted,
}: {
  hourAngle: number;
  minuteAngle: number;
  transition: string;
  muted: boolean;
}) {
  const opacity = muted ? 0.4 : 1;
  return (
    <svg
      viewBox="0 0 96 96"
      className="h-20 w-20 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Face */}
      <circle
        cx="48"
        cy="48"
        r="42"
        fill="none"
        stroke="var(--bd-lime)"
        strokeWidth="1.5"
        opacity={opacity}
      />
      {/* Tick marks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const isMajor = i % 3 === 0;
        const inner = isMajor ? 33 : 36;
        const outer = 41;
        const x1 = 48 + inner * Math.sin(angle);
        const y1 = 48 - inner * Math.cos(angle);
        const x2 = 48 + outer * Math.sin(angle);
        const y2 = 48 - outer * Math.cos(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--bd-lime)"
            strokeWidth={isMajor ? 1.8 : 1}
            strokeLinecap="round"
            opacity={opacity}
          />
        );
      })}
      {/* Hour hand — drawn pointing up from center */}
      <line
        x1="48"
        y1="48"
        x2="48"
        y2="28"
        stroke="var(--bd-lime)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity={opacity}
        style={{
          transformOrigin: '48px 48px',
          transform: `rotate(${hourAngle}deg)`,
          transition,
        }}
      />
      {/* Minute hand */}
      <line
        x1="48"
        y1="48"
        x2="48"
        y2="18"
        stroke="var(--bd-lime)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={opacity}
        style={{
          transformOrigin: '48px 48px',
          transform: `rotate(${minuteAngle}deg)`,
          transition,
        }}
      />
      {/* Center pivot */}
      <circle cx="48" cy="48" r="2.5" fill="var(--bd-lime)" opacity={opacity} />
    </svg>
  );
}
