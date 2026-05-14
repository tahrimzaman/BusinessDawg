'use client';

/**
 * Time chip list — renders the available slots for a chosen date in the
 * visitor's local timezone. Single-select; clicking a chip advances the flow.
 */

import { useMemo } from 'react';

export type Slot = { startUtc: string; endUtc: string };

type Props = {
  slots: Slot[];
  selectedSlot: Slot | null;
  onSelect: (slot: Slot) => void;
  onHover?: (slot: Slot | null) => void;
  visitorTz: string;
};

export default function SlotList({ slots, selectedSlot, onSelect, onHover, visitorTz }: Props) {
  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: visitorTz,
        hour: 'numeric',
        minute: '2-digit',
      }),
    [visitorTz],
  );

  if (slots.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[color:var(--bd-bone)]/60">
        No times available on this day. Pick another.
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" onMouseLeave={() => onHover?.(null)}>
        {slots.map((slot) => {
          const isSelected = selectedSlot?.startUtc === slot.startUtc;
          return (
            <button
              key={slot.startUtc}
              type="button"
              onClick={() => onSelect(slot)}
              onMouseEnter={() => onHover?.(slot)}
              onFocus={() => onHover?.(slot)}
              onBlur={() => onHover?.(null)}
              className={
                'h-12 rounded-full border text-sm font-medium transition-colors ' +
                (isSelected
                  ? 'border-[color:var(--bd-lime)] bg-[color:var(--bd-lime)] text-[color:var(--bd-ink)]'
                  : 'border-white/10 text-[color:var(--bd-bone)] hover:border-[color:var(--bd-lime)] hover:text-[color:var(--bd-lime)]')
              }
            >
              {fmt.format(new Date(slot.startUtc))}
            </button>
          );
        })}
      </div>
      <p className="mt-6 text-center font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
        Times in {visitorTz.replace(/_/g, ' ')}
      </p>
    </div>
  );
}
