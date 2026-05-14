/**
 * Timezone math without a date library. Two pure functions cover everything
 * the booking system needs: getting the UTC offset for a given instant in a
 * given IANA zone, and converting a wall-clock in some zone to UTC. Built on
 * native Intl.DateTimeFormat — no deps, handles DST correctly because each
 * lookup is done against the actual instant, not against a fixed offset.
 */

export type WallClock = {
  y: number; // four-digit year
  m: number; // 1..12
  d: number; // 1..31
  hh: number; // 0..23
  mm: number; // 0..59
};

/**
 * Returns the UTC offset (minutes) for `utcMs` in IANA zone `tz`.
 * Positive = east of UTC (e.g. Asia/Dhaka = +360), negative = west.
 */
export function offsetMinutes(utcMs: number, tz: string): number {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date(utcMs));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  // Build "wall-clock as if it were UTC", then diff from the real UTC instant.
  const asUtcMs = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour') === 24 ? 0 : get('hour'),
    get('minute'),
    get('second'),
  );
  return Math.round((asUtcMs - utcMs) / 60_000);
}

/**
 * Converts a wall-clock value interpreted IN `tz` to UTC milliseconds.
 *
 * Handles DST: iterates twice so the offset used is the one that actually
 * applies at the resulting instant. For spring-forward gaps (non-existent
 * local times) this converges to the post-gap UTC moment; for fall-back
 * overlaps we pick the first (pre-transition) occurrence.
 */
export function zonedTimeToUtc(parts: WallClock, tz: string): number {
  // First pass: pretend the local wall-clock IS UTC.
  const guessUtc = Date.UTC(parts.y, parts.m - 1, parts.d, parts.hh, parts.mm);
  // Correct using the offset that actually applies at that instant.
  const guessOffset = offsetMinutes(guessUtc, tz);
  let utcMs = guessUtc - guessOffset * 60_000;

  // Second pass — DST transitions can shift the offset.
  const refinedOffset = offsetMinutes(utcMs, tz);
  if (refinedOffset !== guessOffset) {
    utcMs = guessUtc - refinedOffset * 60_000;
  }
  return utcMs;
}

/**
 * Returns 'YYYY-MM-DD' for the given UTC instant interpreted in `tz`.
 * Useful for grouping slots by visitor-local calendar day.
 */
export function ymdInTz(utcMs: number, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(utcMs));
}

/** Day-of-week (0 = Sunday, 6 = Saturday) for `utcMs` in `tz`. */
export function dayOfWeekInTz(utcMs: number, tz: string): number {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
  }).format(new Date(utcMs));
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday);
}

/** Parse "HH:mm" → { hh, mm }. Tolerates leading zeros or single digits. */
export function parseHHmm(s: string): { hh: number; mm: number } {
  const [hh, mm] = s.split(':').map((n) => Number(n));
  return { hh: hh || 0, mm: mm || 0 };
}
