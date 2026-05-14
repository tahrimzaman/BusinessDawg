'use client';

/**
 * Availability tab for /admin. Three sections — recurring weekly windows,
 * date exceptions, and the booking-rule singleton. Single "Save changes"
 * button POSTs to /api/admin/availability AND /api/admin/booking-rules
 * concurrently, so the whole config flips atomically from the user's POV.
 */

import { useMemo, useState } from 'react';

type Win = { dayOfWeek: number; startTime: string; endTime: string; active: boolean };
type Exc = {
  date: string;
  blocked: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
};
type Rule = {
  durationMin: number;
  minNoticeMin: number;
  maxHorizonDays: number;
  bufferMin: number;
  maxPerDay: number;
  ownerTz: string;
  meetingTitle: string;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TZ_OPTIONS = (() => {
  try {
    const fn = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] })
      .supportedValuesOf;
    if (typeof fn === 'function') return fn('timeZone');
  } catch {}
  return [
    'UTC',
    'Asia/Dhaka',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Europe/London',
    'Europe/Berlin',
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles',
  ];
})();

export default function AdminAvailabilityPanel({
  initialWindows,
  initialExceptions,
  initialRule,
}: {
  initialWindows: Win[];
  initialExceptions: Exc[];
  initialRule: Rule;
}) {
  const [windows, setWindows] = useState<Win[]>(initialWindows);
  const [exceptions, setExceptions] = useState<Exc[]>(initialExceptions);
  const [rule, setRule] = useState<Rule>(initialRule);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<number, Win[]>();
    for (let d = 0; d < 7; d++) map.set(d, []);
    for (const w of windows) map.get(w.dayOfWeek)?.push(w);
    return map;
  }, [windows]);

  function addWindow(dayOfWeek: number) {
    setWindows((arr) => [
      ...arr,
      { dayOfWeek, startTime: '10:00', endTime: '17:00', active: true },
    ]);
  }

  function updateWindow(idx: number, patch: Partial<Win>) {
    setWindows((arr) => arr.map((w, i) => (i === idx ? { ...w, ...patch } : w)));
  }

  function removeWindow(idx: number) {
    setWindows((arr) => arr.filter((_, i) => i !== idx));
  }

  function addException() {
    const todayIso = new Date().toISOString().slice(0, 10);
    setExceptions((arr) => [
      ...arr,
      { date: todayIso, blocked: true, startTime: null, endTime: null, reason: null },
    ]);
  }

  function updateException(idx: number, patch: Partial<Exc>) {
    setExceptions((arr) => arr.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  }

  function removeException(idx: number) {
    setExceptions((arr) => arr.filter((_, i) => i !== idx));
  }

  async function save() {
    if (saveState === 'saving') return;
    setSaveState('saving');
    setErrorMsg(null);

    try {
      const [avail, rules] = await Promise.all([
        fetch('/api/admin/availability', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ windows, exceptions }),
        }),
        fetch('/api/admin/booking-rules', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            minNoticeMin: rule.minNoticeMin,
            maxHorizonDays: rule.maxHorizonDays,
            bufferMin: rule.bufferMin,
            maxPerDay: rule.maxPerDay,
            ownerTz: rule.ownerTz,
            meetingTitle: rule.meetingTitle,
          }),
        }),
      ]);

      if (!avail.ok || !rules.ok) {
        const m1 = avail.ok ? null : await avail.json().catch(() => null);
        const m2 = rules.ok ? null : await rules.json().catch(() => null);
        throw new Error(m1?.error || m2?.error || 'save failed');
      }

      setSaveState('done');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'save failed');
      setSaveState('error');
    }
  }

  return (
    <div className="space-y-8">
      {/* Recurring weekly schedule */}
      <Section
        eyebrow="Recurring weekly schedule"
        sub="One or more windows per weekday. Times are in your owner timezone."
      >
        <div className="space-y-3">
          {DAYS.map((label, dow) => (
            <DayRow
              key={dow}
              label={label}
              windows={grouped.get(dow) ?? []}
              indexedBaseIndex={(win) => windows.indexOf(win)}
              onAdd={() => addWindow(dow)}
              onUpdate={(idx, patch) => updateWindow(idx, patch)}
              onRemove={(idx) => removeWindow(idx)}
            />
          ))}
        </div>
      </Section>

      {/* Date exceptions */}
      <Section
        eyebrow="Date exceptions"
        sub="Block a date entirely, or override the recurring schedule for a specific day."
      >
        <div className="space-y-3">
          {exceptions.length === 0 && (
            <p className="text-sm text-[color:var(--bd-bone)]/50">
              No exceptions. Add one to take a Thursday off or open up a weekend.
            </p>
          )}
          {exceptions.map((ex, idx) => (
            <ExceptionRow
              key={idx}
              ex={ex}
              onUpdate={(patch) => updateException(idx, patch)}
              onRemove={() => removeException(idx)}
            />
          ))}
          <button
            type="button"
            onClick={addException}
            className="inline-flex h-9 items-center rounded-full border border-white/10 px-4 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase hover:border-[color:var(--bd-lime)] hover:text-[color:var(--bd-lime)]"
          >
            + Add exception
          </button>
        </div>
      </Section>

      {/* Booking rules */}
      <Section
        eyebrow="Booking rules"
        sub="Duration is locked to 15 min in v1. The rest tune the booking window itself."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField
            label="Min notice (minutes)"
            value={rule.minNoticeMin}
            onChange={(v) => setRule((r) => ({ ...r, minNoticeMin: v }))}
            min={0}
            max={10080}
          />
          <NumberField
            label="Max horizon (days)"
            value={rule.maxHorizonDays}
            onChange={(v) => setRule((r) => ({ ...r, maxHorizonDays: v }))}
            min={1}
            max={365}
          />
          <NumberField
            label="Buffer between calls (minutes)"
            value={rule.bufferMin}
            onChange={(v) => setRule((r) => ({ ...r, bufferMin: v }))}
            min={0}
            max={180}
          />
          <NumberField
            label="Max bookings per day"
            value={rule.maxPerDay}
            onChange={(v) => setRule((r) => ({ ...r, maxPerDay: v }))}
            min={1}
            max={48}
          />
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase">
              Owner timezone
            </span>
            <select
              value={rule.ownerTz}
              onChange={(e) => setRule((r) => ({ ...r, ownerTz: e.target.value }))}
              className="h-11 w-full rounded-2xl border border-white/10 bg-[color:var(--bd-ink)] px-4 text-sm text-[color:var(--bd-bone)] focus:border-[color:var(--bd-lime)] focus:outline-none"
            >
              {TZ_OPTIONS.map((tz) => (
                <option
                  key={tz}
                  value={tz}
                  className="bg-[color:var(--bd-ink)] text-[color:var(--bd-bone)]"
                >
                  {tz}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase">
              Meeting title
            </span>
            <input
              type="text"
              value={rule.meetingTitle}
              onChange={(e) => setRule((r) => ({ ...r, meetingTitle: e.target.value }))}
              className="h-11 w-full rounded-2xl border border-white/10 bg-[color:var(--bd-ink)] px-4 text-sm text-[color:var(--bd-bone)] focus:border-[color:var(--bd-lime)] focus:outline-none"
            />
          </label>
        </div>
      </Section>

      {/* Save bar */}
      <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[color:var(--bd-smoke)]/95 p-3 backdrop-blur">
        <p
          className={
            'font-mono text-[10px] tracking-widest uppercase ' +
            (saveState === 'done'
              ? 'text-[color:var(--bd-lime)]'
              : saveState === 'error'
                ? 'text-[color:var(--bd-signal)]'
                : 'text-[color:var(--bd-bone)]/60')
          }
        >
          {saveState === 'saving'
            ? 'Saving…'
            : saveState === 'done'
              ? '✓ Saved'
              : saveState === 'error'
                ? `Error: ${errorMsg ?? 'unknown'}`
                : 'Unsaved changes are local until you save.'}
        </p>
        <button
          type="button"
          onClick={save}
          disabled={saveState === 'saving'}
          className="inline-flex h-11 items-center rounded-full bg-[color:var(--bd-lime)] px-5 text-sm font-semibold text-[color:var(--bd-ink)] transition-colors hover:bg-[color:var(--bd-bone)] disabled:opacity-60"
        >
          {saveState === 'saving' ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

function Section({
  eyebrow,
  sub,
  children,
}: {
  eyebrow: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)] p-6">
      <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-lime)] uppercase">
        / {eyebrow}
      </p>
      <p className="mt-1 text-sm text-[color:var(--bd-bone)]/65">{sub}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function DayRow({
  label,
  windows,
  indexedBaseIndex,
  onAdd,
  onUpdate,
  onRemove,
}: {
  label: string;
  windows: Win[];
  indexedBaseIndex: (w: Win) => number;
  onAdd: () => void;
  onUpdate: (idx: number, patch: Partial<Win>) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-3 rounded-2xl border border-white/10 bg-[color:var(--bd-ink)] p-3 sm:grid-cols-[80px_1fr_auto]">
      <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/80 uppercase">
        {label}
      </p>
      <div className="flex min-w-0 flex-col gap-2">
        {windows.length === 0 && <p className="text-xs text-[color:var(--bd-bone)]/40">Day off.</p>}
        {windows.map((w) => {
          const idx = indexedBaseIndex(w);
          return (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="time"
                value={w.startTime}
                onChange={(e) => onUpdate(idx, { startTime: e.target.value })}
                className="h-9 rounded-full border border-white/10 bg-[color:var(--bd-smoke)] px-3 text-xs text-[color:var(--bd-bone)] focus:border-[color:var(--bd-lime)] focus:outline-none"
              />
              <span className="text-xs text-[color:var(--bd-bone)]/50">to</span>
              <input
                type="time"
                value={w.endTime}
                onChange={(e) => onUpdate(idx, { endTime: e.target.value })}
                className="h-9 rounded-full border border-white/10 bg-[color:var(--bd-smoke)] px-3 text-xs text-[color:var(--bd-bone)] focus:border-[color:var(--bd-lime)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-[color:var(--bd-bone)]/60 hover:border-[color:var(--bd-signal)]/60 hover:text-[color:var(--bd-signal)]"
                aria-label="Remove window"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-9 items-center self-start rounded-full border border-white/10 px-3 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase hover:border-[color:var(--bd-lime)] hover:text-[color:var(--bd-lime)]"
      >
        + Window
      </button>
    </div>
  );
}

function ExceptionRow({
  ex,
  onUpdate,
  onRemove,
}: {
  ex: Exc;
  onUpdate: (patch: Partial<Exc>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-3 rounded-2xl border border-white/10 bg-[color:var(--bd-ink)] p-3 md:grid-cols-[150px_140px_1fr_auto]">
      <input
        type="date"
        value={ex.date}
        onChange={(e) => onUpdate({ date: e.target.value })}
        className="h-9 rounded-full border border-white/10 bg-[color:var(--bd-smoke)] px-3 text-xs text-[color:var(--bd-bone)] focus:border-[color:var(--bd-lime)] focus:outline-none"
      />
      <select
        value={ex.blocked ? 'blocked' : 'add'}
        onChange={(e) => onUpdate({ blocked: e.target.value === 'blocked' })}
        className="h-9 rounded-full border border-white/10 bg-[color:var(--bd-smoke)] px-3 text-xs text-[color:var(--bd-bone)] focus:border-[color:var(--bd-lime)] focus:outline-none"
      >
        <option value="blocked">Blocked</option>
        <option value="add">Extra window</option>
      </select>
      <div className="flex flex-wrap items-center gap-2">
        {ex.blocked ? (
          <>
            <p className="text-xs text-[color:var(--bd-bone)]/50">
              Whole day blocked — leave times empty.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={ex.startTime ?? ''}
                onChange={(e) => onUpdate({ startTime: e.target.value || null })}
                placeholder="From (optional)"
                className="h-9 w-24 rounded-full border border-white/10 bg-[color:var(--bd-smoke)] px-2 text-xs text-[color:var(--bd-bone)] focus:border-[color:var(--bd-lime)] focus:outline-none"
              />
              <span className="text-xs text-[color:var(--bd-bone)]/50">to</span>
              <input
                type="time"
                value={ex.endTime ?? ''}
                onChange={(e) => onUpdate({ endTime: e.target.value || null })}
                placeholder="To (optional)"
                className="h-9 w-24 rounded-full border border-white/10 bg-[color:var(--bd-smoke)] px-2 text-xs text-[color:var(--bd-bone)] focus:border-[color:var(--bd-lime)] focus:outline-none"
              />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={ex.startTime ?? '10:00'}
              onChange={(e) => onUpdate({ startTime: e.target.value })}
              className="h-9 rounded-full border border-white/10 bg-[color:var(--bd-smoke)] px-3 text-xs text-[color:var(--bd-bone)] focus:border-[color:var(--bd-lime)] focus:outline-none"
            />
            <span className="text-xs text-[color:var(--bd-bone)]/50">to</span>
            <input
              type="time"
              value={ex.endTime ?? '17:00'}
              onChange={(e) => onUpdate({ endTime: e.target.value })}
              className="h-9 rounded-full border border-white/10 bg-[color:var(--bd-smoke)] px-3 text-xs text-[color:var(--bd-bone)] focus:border-[color:var(--bd-lime)] focus:outline-none"
            />
          </div>
        )}
        <input
          type="text"
          value={ex.reason ?? ''}
          onChange={(e) => onUpdate({ reason: e.target.value || null })}
          placeholder="Reason (optional)"
          maxLength={200}
          className="h-9 min-w-[160px] flex-1 rounded-full border border-white/10 bg-[color:var(--bd-smoke)] px-3 text-xs text-[color:var(--bd-bone)] focus:border-[color:var(--bd-lime)] focus:outline-none"
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-8 w-8 items-center justify-center self-start rounded-full border border-white/10 text-[color:var(--bd-bone)]/60 hover:border-[color:var(--bd-signal)]/60 hover:text-[color:var(--bd-signal)]"
        aria-label="Remove exception"
      >
        ×
      </button>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(v);
        }}
        className="h-11 w-full rounded-2xl border border-white/10 bg-[color:var(--bd-ink)] px-4 text-sm text-[color:var(--bd-bone)] focus:border-[color:var(--bd-lime)] focus:outline-none"
      />
    </label>
  );
}
