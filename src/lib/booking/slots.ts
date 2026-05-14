/**
 * Pure slot-generation algorithm. Given the booking rule, recurring weekly
 * windows, per-date exceptions, plus the bookings + active holds that already
 * exist, return the list of bookable UTC slots inside [from, to].
 *
 * Everything happens in the owner's tz for layout (windows are HH:mm strings)
 * and UTC for arithmetic (slots, bookings, holds). The visitor's tz only
 * matters at display time, so this function is timezone-agnostic from the
 * caller's perspective.
 */

import { zonedTimeToUtc, ymdInTz, dayOfWeekInTz, parseHHmm } from './tz';

export type Slot = { startUtc: string; endUtc: string };

export type Rule = {
  durationMin: number;
  minNoticeMin: number;
  maxHorizonDays: number;
  bufferMin: number;
  maxPerDay: number;
  ownerTz: string;
};

export type WeeklyWindow = {
  dayOfWeek: number; // 0..6, Sunday = 0
  startTime: string; // "HH:mm" in owner tz
  endTime: string;
  active: boolean;
};

export type DateException = {
  date: string; // "YYYY-MM-DD" in owner tz
  blocked: boolean;
  startTime: string | null;
  endTime: string | null;
};

export type BusyInterval = { startUtc: number; endUtc: number };

type GenerateInput = {
  fromUtc: number;
  toUtc: number;
  now: number;
  rule: Rule;
  windows: WeeklyWindow[];
  exceptions: DateException[];
  bookings: BusyInterval[];
  holds: BusyInterval[];
};

type LocalInterval = { startMin: number; endMin: number }; // minutes since 00:00

function toLocalInterval(startTime: string, endTime: string): LocalInterval {
  const s = parseHHmm(startTime);
  const e = parseHHmm(endTime);
  return { startMin: s.hh * 60 + s.mm, endMin: e.hh * 60 + e.mm };
}

function subtract(intervals: LocalInterval[], blocker: LocalInterval): LocalInterval[] {
  const out: LocalInterval[] = [];
  for (const iv of intervals) {
    if (blocker.endMin <= iv.startMin || blocker.startMin >= iv.endMin) {
      out.push(iv);
      continue;
    }
    if (blocker.startMin > iv.startMin) {
      out.push({ startMin: iv.startMin, endMin: Math.min(blocker.startMin, iv.endMin) });
    }
    if (blocker.endMin < iv.endMin) {
      out.push({ startMin: Math.max(blocker.endMin, iv.startMin), endMin: iv.endMin });
    }
  }
  return out;
}

function mergeAdd(intervals: LocalInterval[], add: LocalInterval): LocalInterval[] {
  const sorted = [...intervals, add].sort((a, b) => a.startMin - b.startMin);
  const out: LocalInterval[] = [];
  for (const iv of sorted) {
    const last = out[out.length - 1];
    if (last && iv.startMin <= last.endMin) {
      last.endMin = Math.max(last.endMin, iv.endMin);
    } else {
      out.push({ ...iv });
    }
  }
  return out;
}

function overlapsAny(startUtc: number, endUtc: number, busy: BusyInterval[], bufferMs: number) {
  for (const b of busy) {
    if (startUtc < b.endUtc + bufferMs && endUtc + bufferMs > b.startUtc) return true;
  }
  return false;
}

/**
 * Enumerates owner-local calendar dates (YYYY-MM-DD) that fall inside
 * [fromUtc, toUtc]. Walks day-by-day in 24h UTC steps and converts each
 * instant to the owner-local date; deduplicates via Set.
 */
function ownerLocalDays(fromUtc: number, toUtc: number, ownerTz: string): string[] {
  const seen = new Set<string>();
  // Probe at noon UTC of each calendar day to avoid landing on a DST hour gap.
  const startProbe = new Date(fromUtc);
  startProbe.setUTCHours(12, 0, 0, 0);
  let cursor = startProbe.getTime();
  // Go back one day in case the local date for `from` was earlier than the UTC date.
  cursor -= 86_400_000;
  while (cursor <= toUtc + 86_400_000) {
    seen.add(ymdInTz(cursor, ownerTz));
    cursor += 86_400_000;
  }
  return Array.from(seen).sort();
}

export function generateSlots(input: GenerateInput): Slot[] {
  const { fromUtc, toUtc, now, rule, windows, exceptions, bookings, holds } = input;

  const horizonMs = rule.maxHorizonDays * 86_400_000;
  const earliest = Math.max(fromUtc, now + rule.minNoticeMin * 60_000);
  const latest = Math.min(toUtc, now + horizonMs);
  if (latest < earliest) return [];

  const bufferMs = rule.bufferMin * 60_000;
  const stepMs = rule.durationMin * 60_000;
  const days = ownerLocalDays(earliest, latest, rule.ownerTz);

  // Group exceptions by date.
  const exByDate = new Map<string, DateException[]>();
  for (const ex of exceptions) {
    const arr = exByDate.get(ex.date) ?? [];
    arr.push(ex);
    exByDate.set(ex.date, arr);
  }

  // Pre-filter windows to active ones.
  const activeWindows = windows.filter((w) => w.active);

  const out: Slot[] = [];

  for (const ymd of days) {
    // Resolve dayOfWeek for this owner-local date (probe at noon owner-tz).
    const [y, m, d] = ymd.split('-').map(Number);
    const noonUtc = zonedTimeToUtc({ y, m, d, hh: 12, mm: 0 }, rule.ownerTz);
    const dow = dayOfWeekInTz(noonUtc, rule.ownerTz);

    // Start with recurring windows for this weekday.
    let intervals: LocalInterval[] = activeWindows
      .filter((w) => w.dayOfWeek === dow)
      .map((w) => toLocalInterval(w.startTime, w.endTime))
      .filter((iv) => iv.endMin > iv.startMin);

    // Apply exceptions for this exact date.
    const dayExceptions = exByDate.get(ymd) ?? [];
    let wholeDayBlocked = false;
    for (const ex of dayExceptions) {
      if (ex.blocked && !ex.startTime) {
        wholeDayBlocked = true;
        break;
      }
      if (ex.blocked && ex.startTime && ex.endTime) {
        intervals = subtract(intervals, toLocalInterval(ex.startTime, ex.endTime));
      }
      if (!ex.blocked && ex.startTime && ex.endTime) {
        intervals = mergeAdd(intervals, toLocalInterval(ex.startTime, ex.endTime));
      }
    }
    if (wholeDayBlocked) continue;
    if (intervals.length === 0) continue;

    let bookedThisDay = 0;
    for (const b of bookings) {
      const startYmd = ymdInTz(b.startUtc, rule.ownerTz);
      if (startYmd === ymd) bookedThisDay++;
    }
    if (bookedThisDay >= rule.maxPerDay) continue;

    for (const iv of intervals) {
      for (
        let cursor = iv.startMin;
        cursor + rule.durationMin <= iv.endMin;
        cursor += rule.durationMin
      ) {
        const hh = Math.floor(cursor / 60);
        const mm = cursor % 60;
        const startUtcMs = zonedTimeToUtc({ y, m, d, hh, mm }, rule.ownerTz);
        const endUtcMs = startUtcMs + stepMs;

        if (startUtcMs < earliest) continue;
        if (startUtcMs >= latest) break;
        if (overlapsAny(startUtcMs, endUtcMs, bookings, bufferMs)) continue;
        if (overlapsAny(startUtcMs, endUtcMs, holds, bufferMs)) continue;
        if (bookedThisDay >= rule.maxPerDay) break;

        out.push({
          startUtc: new Date(startUtcMs).toISOString(),
          endUtc: new Date(endUtcMs).toISOString(),
        });
      }
    }
  }

  return out;
}
