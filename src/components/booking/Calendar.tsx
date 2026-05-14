'use client';

/**
 * Month-grid date picker — only days with at least one available slot are
 * clickable. Past dates and empty dates render muted. Week starts on Monday.
 */

import { useMemo, useState } from 'react';

type Props = {
  availableDates: Set<string>; // 'YYYY-MM-DD' in visitor tz
  selectedDate: string | null;
  onSelect: (date: string) => void;
  onHover?: (date: string | null) => void;
  visitorTz: string;
};

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function ymdInTz(d: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function buildMonthGrid(viewMonth: Date): (Date | null)[] {
  const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const lastOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
  // Mon=0 ... Sun=6 — getDay() returns Sun=0..Sat=6
  const firstDayIdx = (firstOfMonth.getDay() + 6) % 7;
  const totalDays = lastOfMonth.getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDayIdx; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++)
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  while (cells.length < 42) cells.push(null);
  return cells;
}

export default function Calendar({
  availableDates,
  selectedDate,
  onSelect,
  onHover,
  visitorTz,
}: Props) {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => ymdInTz(today, visitorTz), [today, visitorTz]);

  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const d = new Date(today);
    d.setDate(1);
    return d;
  });

  const cells = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);
  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    const d = new Date(viewMonth);
    d.setMonth(d.getMonth() - 1);
    setViewMonth(d);
  };
  const nextMonth = () => {
    const d = new Date(viewMonth);
    d.setMonth(d.getMonth() + 1);
    setViewMonth(d);
  };

  // Disable "prev" if it would go below today's month
  const isPrevDisabled =
    viewMonth.getFullYear() < today.getFullYear() ||
    (viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() <= today.getMonth());

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          disabled={isPrevDisabled}
          aria-label="Previous month"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[color:var(--bd-bone)] transition-colors hover:border-[color:var(--bd-lime)] hover:text-[color:var(--bd-lime)] disabled:cursor-not-allowed disabled:opacity-30"
        >
          ←
        </button>
        <p className="font-display text-base font-bold text-[color:var(--bd-bone)] sm:text-lg">
          {monthLabel}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Next month"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[color:var(--bd-bone)] transition-colors hover:border-[color:var(--bd-lime)] hover:text-[color:var(--bd-lime)]"
        >
          →
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEK.map((d) => (
          <div
            key={d}
            className="text-center font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/40 uppercase"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1" onMouseLeave={() => onHover?.(null)}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} aria-hidden />;
          const dateStr = ymdInTz(cell, visitorTz);
          const isAvailable = availableDates.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const isPast = dateStr < todayStr;
          const disabled = !isAvailable || isPast;
          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(dateStr)}
              onMouseEnter={disabled ? undefined : () => onHover?.(dateStr)}
              onFocus={disabled ? undefined : () => onHover?.(dateStr)}
              onBlur={disabled ? undefined : () => onHover?.(null)}
              className={
                'aspect-square rounded-full text-sm font-medium transition-colors ' +
                (isSelected
                  ? 'bg-[color:var(--bd-lime)] text-[color:var(--bd-ink)]'
                  : isAvailable && !isPast
                    ? 'bg-white/[0.04] text-[color:var(--bd-bone)] hover:bg-white/[0.08]'
                    : 'cursor-not-allowed text-[color:var(--bd-bone)]/25')
              }
              aria-label={cell.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
