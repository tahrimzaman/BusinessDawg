'use client';

/**
 * Mobile-only iOS-style scroll-wheel time picker. Three independent
 * vertical wheels (HH | MM | AM-PM). Each wheel uses native
 * `scroll-snap-type: y mandatory` so the centered row is the value.
 *
 * The wheels are deliberately "open" — a user can land on any
 * combination (e.g. 12:30 AM). Whether that combination maps to a real
 * available slot is determined by lookup against `slots`. The parent
 * gets `onChange(slot | null)` so it can enable/disable the Confirm CTA
 * and animate the ClockPreview to the matching time.
 *
 * Reduced-motion / SSR fallback: we still render the three wheels (the
 * scroll-snap and JS-driven center detection both work without animation),
 * but the parent BookingFlow gates the entire component to `lg:hidden`
 * and shows the pill grid on desktop.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Slot } from './SlotList';

type Props = {
  slots: Slot[];
  selectedSlot: Slot | null;
  onChange: (slot: Slot | null) => void;
  visitorTz: string;
};

const ROW_H = 40; // px — keep in sync with the inline style on .row + scroller padding

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * Decompose a UTC slot into the visitor's local (h12, mm, period). Mirrors
 * the formatting used by ClockPreview / SlotList so the wheel and the pills
 * agree on which value any given slot represents.
 */
function slotParts(slot: Slot, tz: string): { h12: number; mm: number; period: 'AM' | 'PM' } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(new Date(slot.startUtc));
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '12', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
  const dayPeriod = (parts.find((p) => p.type === 'dayPeriod')?.value ?? 'AM').toUpperCase() as
    | 'AM'
    | 'PM';
  return { h12: hour === 0 ? 12 : hour, mm: minute, period: dayPeriod };
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES = [0, 30]; // 30-min cadence
const PERIODS: Array<'AM' | 'PM'> = ['AM', 'PM'];

export default function TimeWheel({ slots, selectedSlot, onChange, visitorTz }: Props) {
  // Build the set of "available" combinations so we can dim invalid rows.
  const availability = useMemo(() => {
    const combos = new Set<string>();
    const byHour = new Set<number>();
    const byPeriod = new Set<string>();
    const minuteByHourPeriod = new Map<string, Set<number>>();
    for (const s of slots) {
      const { h12, mm, period } = slotParts(s, visitorTz);
      combos.add(`${h12}-${mm}-${period}`);
      byHour.add(h12);
      byPeriod.add(period);
      const key = `${h12}-${period}`;
      const existing = minuteByHourPeriod.get(key) ?? new Set<number>();
      existing.add(mm);
      minuteByHourPeriod.set(key, existing);
    }
    return { combos, byHour, byPeriod, minuteByHourPeriod };
  }, [slots, visitorTz]);

  // Initial wheel state — snap to the currently-selected slot if any,
  // otherwise to the first available combo, otherwise 10:00 AM.
  const initial = useMemo(() => {
    if (selectedSlot) return slotParts(selectedSlot, visitorTz);
    if (slots.length > 0) return slotParts(slots[0], visitorTz);
    return { h12: 10, mm: 0, period: 'AM' as const };
  }, [selectedSlot, slots, visitorTz]);

  const [h12, setH12] = useState(initial.h12);
  const [mm, setMm] = useState(initial.mm);
  const [period, setPeriod] = useState<'AM' | 'PM'>(initial.period);

  // Push the latest matching slot up to the parent so ClockPreview animates
  // and Confirm enables/disables. Lookup is O(1) via the slots-by-key map.
  const slotByKey = useMemo(() => {
    const m = new Map<string, Slot>();
    for (const s of slots) {
      const p = slotParts(s, visitorTz);
      m.set(`${p.h12}-${p.mm}-${p.period}`, s);
    }
    return m;
  }, [slots, visitorTz]);

  useEffect(() => {
    const match = slotByKey.get(`${h12}-${mm}-${period}`) ?? null;
    onChange(match);
  }, [h12, mm, period, slotByKey, onChange]);

  return (
    <div className="w-full max-w-full overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-ink)] p-4">
      <div
        className="relative grid w-full gap-2"
        style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)' }}
      >
        {/* Center selection band — two lime hairlines aligned to the centered
            row, shared across all three columns. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2"
          style={{ height: ROW_H }}
        >
          <div className="absolute inset-x-2 top-0 h-px bg-[color:var(--bd-lime)]/60" />
          <div className="absolute inset-x-2 bottom-0 h-px bg-[color:var(--bd-lime)]/60" />
        </div>

        <Wheel
          values={HOURS}
          value={h12}
          onChange={setH12}
          render={(v) => `${v}`}
          isAvailable={(v) => availability.byHour.has(v)}
        />
        <Wheel
          values={MINUTES}
          value={mm}
          onChange={setMm}
          render={(v) => pad2(v)}
          isAvailable={(v) => {
            const set = availability.minuteByHourPeriod.get(`${h12}-${period}`);
            return set ? set.has(v) : false;
          }}
        />
        <Wheel
          values={PERIODS}
          value={period}
          onChange={(v) => setPeriod(v as 'AM' | 'PM')}
          render={(v) => v}
          isAvailable={(v) => availability.byPeriod.has(v)}
        />
      </div>
      <p className="mt-3 text-center font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/45 uppercase">
        Times in {visitorTz.replace(/_/g, ' ')}
      </p>
    </div>
  );
}

/**
 * Single vertical wheel. Renders all `values` as rows in a scroll-snap
 * container. The centered row (computed from scrollTop) is the active
 * value; rAF-debounced so we don't spam state during a flick.
 */
function Wheel<T extends string | number>({
  values,
  value,
  onChange,
  render,
  isAvailable,
}: {
  values: T[];
  value: T;
  onChange: (v: T) => void;
  render: (v: T) => string;
  isAvailable: (v: T) => boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  // Track whether the wheel's scrollTop currently matches `value` so we
  // can skip our own scroll-driven updates during a programmatic snap.
  const programmaticRef = useRef(false);

  // Snap the wheel to `value` whenever the parent state changes (initial
  // mount, parent reset, etc). Programmatic scroll guard prevents the
  // resulting scroll event from firing back into onChange.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = values.indexOf(value);
    if (idx < 0) return;
    const target = idx * ROW_H;
    if (Math.abs(el.scrollTop - target) < 1) return;
    programmaticRef.current = true;
    el.scrollTo({ top: target, behavior: 'auto' });
    // Release the guard on the next frame so a real user-initiated scroll
    // immediately after still registers.
    requestAnimationFrame(() => {
      programmaticRef.current = false;
    });
  }, [value, values]);

  function handleScroll() {
    if (programmaticRef.current) return;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = scrollerRef.current;
      if (!el) return;
      const idx = Math.round(el.scrollTop / ROW_H);
      const clamped = Math.max(0, Math.min(values.length - 1, idx));
      const next = values[clamped];
      if (next !== value) onChange(next);
    });
  }

  // Padding pushes the first/last rows so they can land in the center.
  const padRows = 2;

  return (
    <div
      ref={scrollerRef}
      onScroll={handleScroll}
      data-lenis-prevent
      className="relative h-[200px] min-w-0 snap-y snap-mandatory [scrollbar-width:none] overflow-y-scroll [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      style={{ scrollSnapStop: 'always' }}
    >
      <div style={{ height: padRows * ROW_H }} aria-hidden />
      {values.map((v) => {
        const available = isAvailable(v);
        const isCenter = v === value;
        return (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={
              'font-display flex w-full snap-center items-center justify-center text-2xl font-bold italic transition-opacity ' +
              (isCenter
                ? available
                  ? 'text-[color:var(--bd-lime)] opacity-100'
                  : 'text-[color:var(--bd-bone)]/50 opacity-100'
                : available
                  ? 'text-[color:var(--bd-bone)] opacity-70'
                  : 'cursor-not-allowed text-[color:var(--bd-bone)]/25 opacity-50')
            }
            style={{ height: ROW_H, scrollSnapAlign: 'center' }}
          >
            {render(v)}
          </button>
        );
      })}
      <div style={{ height: padRows * ROW_H }} aria-hidden />
    </div>
  );
}
