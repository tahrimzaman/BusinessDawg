'use client';

/**
 * Horizontal 21-day strip date picker. Replaces the month-grid Calendar
 * since the booking horizon is capped at 21 days — a full month picker
 * was overkill and forced a year display nobody needed.
 *
 * Each cell is a tall pill: weekday letter on top, day number below.
 * - Day 0 renders "TODAY" in lime instead of the weekday letter.
 * - Day 1 renders "TMRW".
 * - When a cell's date is the 1st of a new month (or the very first cell),
 *   a small month chip (`JUN`) sits above the row at that column.
 * - The year is hidden unless the strip crosses Dec 31 — in that case the
 *   year (`'27`) is shown next to the month chip on the year-crossing cell.
 *
 * Behavior:
 * - Snap-scroll horizontally on mobile; flex row on desktop.
 * - Days with no available slots render disabled (muted, not clickable).
 * - Selected day is filled lime; hovered day gets a lime border.
 */

import { useMemo, useRef } from 'react';

type Props = {
  availableDates: Set<string>; // 'YYYY-MM-DD' in visitor tz
  selectedDate: string | null;
  onSelect: (date: string) => void;
  onHover?: (date: string | null) => void;
  visitorTz: string;
  horizonDays?: number; // default 21
};

function ymdInTz(d: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

const WEEK_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Sun..Sat
const MONTHS_SHORT = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

export default function DateStrip({
  availableDates,
  selectedDate,
  onSelect,
  onHover,
  visitorTz,
  horizonDays = 21,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const cells = useMemo(() => {
    const today = new Date();
    const out: Array<{
      date: Date;
      ymd: string;
      day: number;
      weekdayLetter: string;
      isToday: boolean;
      isTomorrow: boolean;
      monthBadge: string | null; // 'JUN' or "'27" appended
      year: number;
      isYearBoundary: boolean;
    }> = [];
    const startYear = today.getFullYear();
    for (let i = 0; i < horizonDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const ymd = ymdInTz(d, visitorTz);
      const day = d.getDate();
      const month = d.getMonth();
      const year = d.getFullYear();
      const weekdayIdx = d.getDay();
      const isFirstOfMonth = day === 1;
      const isFirstCell = i === 0;
      const yearChanged = year !== startYear;
      let monthBadge: string | null = null;
      if (isFirstCell || isFirstOfMonth) {
        monthBadge = MONTHS_SHORT[month];
        if (yearChanged) {
          monthBadge += ` '${String(year).slice(-2)}`;
        }
      }
      out.push({
        date: d,
        ymd,
        day,
        weekdayLetter: WEEK_LETTERS[weekdayIdx],
        isToday: i === 0,
        isTomorrow: i === 1,
        monthBadge,
        year,
        isYearBoundary: yearChanged && day === 1 && month === 0,
      });
    }
    return out;
  }, [visitorTz, horizonDays]);

  return (
    <div className="relative">
      {/* Month badges row — sits above the day pills, aligned to whichever
          cell triggers a badge. Same flex layout, transparent cells where
          there's no badge. */}
      <div className="pointer-events-none mb-2 flex gap-2 overflow-hidden px-1" aria-hidden>
        {cells.map((c, i) => (
          <div key={`badge-${i}`} className="flex w-14 shrink-0 justify-center sm:w-16">
            {c.monthBadge ? (
              <span
                className={
                  'font-mono text-[10px] tracking-widest uppercase ' +
                  (c.isYearBoundary
                    ? 'text-[color:var(--bd-lime)]'
                    : 'text-[color:var(--bd-bone)]/55')
                }
              >
                {c.monthBadge}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-2 lg:snap-none"
        data-lenis-prevent
        onMouseLeave={() => onHover?.(null)}
      >
        {cells.map((c) => {
          const isAvailable = availableDates.has(c.ymd);
          const isSelected = selectedDate === c.ymd;
          const labelTop = c.isToday ? 'TODAY' : c.isTomorrow ? 'TMRW' : c.weekdayLetter;
          return (
            <button
              key={c.ymd}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelect(c.ymd)}
              onMouseEnter={isAvailable ? () => onHover?.(c.ymd) : undefined}
              onFocus={isAvailable ? () => onHover?.(c.ymd) : undefined}
              onBlur={isAvailable ? () => onHover?.(null) : undefined}
              aria-pressed={isSelected}
              aria-label={c.date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
              className={
                'flex h-20 w-14 shrink-0 snap-center flex-col items-center justify-center gap-1 rounded-2xl border transition-all sm:w-16 ' +
                (isSelected
                  ? 'border-[color:var(--bd-lime)] bg-[color:var(--bd-lime)] text-[color:var(--bd-ink)] shadow-[0_0_24px_-4px_color-mix(in_srgb,var(--bd-lime)_50%,transparent)]'
                  : isAvailable
                    ? 'border-white/10 bg-[color:var(--bd-ink)] text-[color:var(--bd-bone)] hover:border-[color:var(--bd-lime)] hover:text-[color:var(--bd-lime)]'
                    : 'cursor-not-allowed border-white/5 bg-transparent text-[color:var(--bd-bone)]/20')
              }
            >
              <span
                className={
                  'font-mono text-[10px] tracking-widest uppercase ' +
                  (isSelected
                    ? 'text-[color:var(--bd-ink)]/80'
                    : c.isToday || c.isTomorrow
                      ? isAvailable
                        ? 'text-[color:var(--bd-lime)]'
                        : 'text-[color:var(--bd-lime)]/40'
                      : '')
                }
              >
                {labelTop}
              </span>
              <span className="font-display text-2xl leading-none font-bold italic">{c.day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
